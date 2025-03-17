package main

import (
	"log"
	//"net/http" // Added import for http
	"os"
	"time"

	"lms/backend/config"
	"lms/backend/handlers"
	"lms/backend/middlewares"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Connect to the database.
	config.ConnectDatabase()

	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	// Setup CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Adjust this as needed for production
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "X-User-Email"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// All endpoints are now grouped under "/api".
	api := router.Group("/api")
	{
		// Unauthenticated endpoints:
		api.POST("/signin", handlers.SignIn)             // SignIn endpoint
		api.POST("/library/create", handlers.CreateLibrary) // Create library and owner
		api.POST("/reader/create", handlers.CreateReader)   // Create Reader endpoint
		api.GET("/libraries", handlers.ListLibraries)

		// Global authentication middleware (checks for X-User-Email header)
		api.Use(middlewares.AuthMiddleware)

		// Library Owner Flow: Onboard a LibraryAdmin.
		api.POST("/owner/admin/create", handlers.CreateAdmin)

		// Admin routes: accessible by Owner or LibraryAdmin.
		adminGroup := api.Group("/admin")
		adminGroup.Use(middlewares.AdminMiddleware)
		{
			adminGroup.POST("/books", handlers.AddBook)
			adminGroup.DELETE("/books/:isbn", handlers.RemoveBook)
			adminGroup.PUT("/books/:isbn", handlers.UpdateBook)
			adminGroup.GET("/requests", handlers.ListIssueRequests)
			adminGroup.POST("/requests/:reqid/approve", handlers.ApproveIssueRequest)
			adminGroup.POST("/requests/:reqid/reject", handlers.RejectIssueRequest)
		}

		// Reader routes.
		readerGroup := api.Group("/reader")
		readerGroup.Use(middlewares.ReaderMiddleware)
		{
			readerGroup.GET("/books", handlers.SearchBooks)
			readerGroup.POST("/request", handlers.RaiseIssueRequest)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Server running on port", port)
	router.Run(":" + port)
}
