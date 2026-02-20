package handlers

import (
	"github.com/adhy/task-management/api/database"
	"github.com/adhy/task-management/api/models"
	"github.com/gofiber/fiber/v2"
)

// GetCategories godoc
// @Summary Get all categories for the authenticated user
// @Description Get a list of all categories belonging to the logged-in user
// @Tags categories
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Success 200 {array} models.Category
// @Router /api/categories [get]
func GetCategories(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	categories := []models.Category{}
	database.DB.Where("user_id = ?", userID).Find(&categories)

	// If no categories, seed some defaults
	if len(categories) == 0 {
		defaults := []models.Category{
			{UserID: userID, Name: "Work", Color: "blue"},
			{UserID: userID, Name: "Personal", Color: "emerald"},
			{UserID: userID, Name: "Urgent", Color: "red"},
			{UserID: userID, Name: "Study", Color: "amber"},
		}
		for _, cat := range defaults {
			database.DB.Create(&cat)
		}
		database.DB.Where("user_id = ?", userID).Find(&categories)
	}

	return c.JSON(categories)
}

// CreateCategory godoc
// @Summary Create a new category
func CreateCategory(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	category := new(models.Category)
	if err := c.BodyParser(category); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}
	category.UserID = userID
	database.DB.Create(category)
	return c.Status(201).JSON(category)
}
