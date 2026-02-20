package handlers

import (
	"strconv"
	"time"

	"github.com/adhy/task-management/api/database"

	"github.com/adhy/task-management/api/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// GetTasks godoc
// @Summary Get all tasks for the authenticated user
// @Description Get a list of all tasks belonging to the logged-in user
// @Tags tasks
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {array} models.Task
// @Router /api/tasks [get]
func GetTasks(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	// Pagination parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	offset := (page - 1) * limit

	// Filter parameters
	search := c.Query("search", "")
	status := c.Query("status", "all")
	categoryID := c.Query("category_id", "")

	query := database.DB.Preload("Subtasks").Joins("Category").Where("tasks.user_id = ?", userID)

	// Apply Search Filter
	if search != "" {
		query = query.Where("tasks.title ILIKE ?", "%"+search+"%")
	}

	// Apply Status Filter
	if status != "all" {
		query = query.Where("tasks.status = ?", status)
	}

	// Apply Category Filter
	if categoryID != "" && categoryID != "0" {
		query = query.Where("tasks.category_id = ?", categoryID)
	}

	tasks := []models.Task{}
	query.Order("tasks.created_at DESC").Limit(limit).Offset(offset).Find(&tasks)

	return c.JSON(tasks)
}

func GetTaskStats(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	now := time.Now()
	todayStr := now.Format("2006-01-02")

	var stats struct {
		Total     int64 `json:"total"`
		Completed int64 `json:"completed"`
		Pending   int64 `json:"pending"`
		High      int64 `json:"high"`
		Overdue   int64 `json:"overdue"`
		DueToday  int64 `json:"dueToday"`
		ChartData []struct {
			Date  string `json:"date"`
			Count int64  `json:"count"`
		} `json:"chartData"`
	}

	database.DB.Model(&models.Task{}).Where("user_id = ?", userID).Count(&stats.Total)
	database.DB.Model(&models.Task{}).Where("user_id = ? AND status = ?", userID, "completed").Count(&stats.Completed)
	stats.Pending = stats.Total - stats.Completed
	database.DB.Model(&models.Task{}).Where("user_id = ? AND priority = ? AND status != ?", userID, "high", "completed").Count(&stats.High)

	// Overdue stats
	database.DB.Model(&models.Task{}).Where("user_id = ? AND status != ? AND due_date < ? AND TO_CHAR(due_date, 'YYYY-MM-DD') != ?", userID, "completed", now, todayStr).Count(&stats.Overdue)

	// Due Today stats
	database.DB.Model(&models.Task{}).Where("user_id = ? AND status != ? AND TO_CHAR(due_date, 'YYYY-MM-DD') = ?", userID, "completed", todayStr).Count(&stats.DueToday)

	// Chart Data (Last 7 days productivity)
	for i := 6; i >= 0; i-- {
		date := now.AddDate(0, 0, -i)
		dateStr := date.Format("2006-01-02")
		var count int64
		database.DB.Model(&models.Task{}).Where("user_id = ? AND status = ? AND TO_CHAR(updated_at, 'YYYY-MM-DD') = ?", userID, "completed", dateStr).Count(&count)
		stats.ChartData = append(stats.ChartData, struct {
			Date  string `json:"date"`
			Count int64  `json:"count"`
		}{Date: date.Format("Mon"), Count: count})
	}

	return c.JSON(stats)
}

// GetTask godoc
// @Summary Get a single task
// @Description Get a task by ID for the authenticated user
// @Tags tasks
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path int true "Task ID"
// @Success 200 {object} models.Task
// @Failure 404 {object} map[string]string
// @Router /api/tasks/{id} [get]
func GetTask(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id := c.Params("id")
	var task models.Task
	result := database.DB.Preload("Subtasks").Joins("Category").Where("tasks.id = ? AND tasks.user_id = ?", id, userID).First(&task)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}
	return c.JSON(task)
}

// CreateTask godoc
// @Summary Create a new task
// @Description Create a new task for the authenticated user
// @Tags tasks
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param task body models.Task true "Task Object"
// @Success 201 {object} models.Task
// @Failure 400 {object} map[string]string
// @Router /api/tasks [post]
func CreateTask(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	task := new(models.Task)
	if err := c.BodyParser(task); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	task.UserID = userID
	database.DB.Create(task)
	return c.Status(201).JSON(task)
}

// UpdateTask godoc
// @Summary Update an existing task
// @Description Update task details by ID for the authenticated user
// @Tags tasks
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path int true "Task ID"
// @Param task body models.Task true "Updated Task Object"
// @Success 200 {object} models.Task
// @Failure 400,404 {object} map[string]string
// @Router /api/tasks/{id} [put]
func UpdateTask(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id := c.Params("id")
	var task models.Task
	if result := database.DB.Preload("Subtasks").Joins("Category").Where("tasks.id = ? AND tasks.user_id = ?", id, userID).First(&task); result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}

	if err := c.BodyParser(&task); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	database.DB.Session(&gorm.Session{FullSaveAssociations: true}).Save(&task)
	return c.JSON(task)
}

// DeleteTask godoc
// @Summary Delete a task
// @Description Delete a task by ID for the authenticated user
// @Tags tasks
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path int true "Task ID"
// @Success 204 "No Content"
// @Failure 404 {object} map[string]string
// @Router /api/tasks/{id} [delete]
func DeleteTask(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id := c.Params("id")
	var task models.Task
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&task); result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Task not found"})
	}
	database.DB.Delete(&task)
	return c.SendStatus(204)
}
