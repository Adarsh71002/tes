package handlers

import (
	"net/http"

	"lms/backend/config"
	"lms/backend/models"

	"github.com/gin-gonic/gin"
)

// payload for creating a reader.
type CreateReaderRequest struct {
	Name          string `json:"name" binding:"required"`
	Email         string `json:"email" binding:"required,email"`
	ContactNumber string `json:"contactNumber"`
	LibID         uint   `json:"libID" binding:"required"`
}

func CreateReader(c *gin.Context) {
	var req CreateReaderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var lib models.Library
	if err := config.DB.Where("id = ?", req.LibID).First(&lib).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid library id"})
		return
	}

	// Create a new reader with the "Reader" role.
	reader := models.User{
		Name:          req.Name,
		Email:         req.Email,
		ContactNumber: req.ContactNumber,
		Role:          "Reader",
		LibID:         req.LibID,
	}

	if err := config.DB.Create(&reader).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reader"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Reader created successfully", "reader": reader})
}