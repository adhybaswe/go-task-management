package main

import (
	"log"
	"os"

	"github.com/adhy/task-management/api/database"
	_ "github.com/adhy/task-management/api/docs"
	"github.com/adhy/task-management/api/handlers"
	"github.com/adhy/task-management/api/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	fiberSwagger "github.com/swaggo/fiber-swagger"
)

// @title Task Management API
// @version 1.0
// @description This is a task management server.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:3001
// @BasePath /

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default environment variables")
	}

	// Connect to database
	database.Connect()

	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New())

	// Swagger route
	app.Get("/swagger/*", fiberSwagger.WrapHandler)

	// Routes
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	api := app.Group("/api")

	// Auth Routes
	auth := api.Group("/auth")
	auth.Post("/register", handlers.Register)
	auth.Post("/login", handlers.Login)

	// Task Routes (Protected)
	tasks := api.Group("/tasks")
	tasks.Use(middleware.AuthRequired)
	tasks.Get("/", handlers.GetTasks)
	tasks.Get("/stats", handlers.GetTaskStats)
	tasks.Get("/:id", handlers.GetTask)
	tasks.Post("/", handlers.CreateTask)
	tasks.Put("/:id", handlers.UpdateTask)
	tasks.Delete("/:id", handlers.DeleteTask)

	// Category Routes (Protected)
	categories := api.Group("/categories")
	categories.Use(middleware.AuthRequired)
	categories.Get("", handlers.GetCategories)
	categories.Post("", handlers.CreateCategory)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	log.Fatal(app.Listen(":" + port))
}
