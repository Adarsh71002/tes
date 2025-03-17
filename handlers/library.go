package handlers

import (
	"net/http"

	"lms/backend/config"
	"lms/backend/models"

	"github.com/gin-gonic/gin"
)

type CreateLibraryRequest struct {
	LibraryName  string `json:"libraryName" binding:"required"`
	OwnerName    string `json:"OwnerName" binding:"required"`
	OwnerEmail   string `json:"ownerEmail" binding:"required,email"`
	OwnerContact string `json:"ownerContact"`
}

// creates a new library and registers the owner.
func CreateLibrary(c *gin.Context) {
	var req CreateLibraryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid required fields"})
		return
	}

	// Check if library already exists.
	var lib models.Library
	if err := config.DB.Where("name = ?", req.LibraryName).First(&lib).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Library name already exists. Please choose a new name."})
		return
	}

	// Create new library.
	newLib := models.Library{Name: req.LibraryName}
	if err := config.DB.Create(&newLib).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error creating library"})
		return
	}

	// Create the Owner user.
	owner := models.User{
		Name:          req.OwnerName,
		Email:         req.OwnerEmail,
		ContactNumber: req.OwnerContact,
		Role:          "Owner",
		LibID:         newLib.ID,
	}
	if err := config.DB.Create(&owner).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error creating owner user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Library created successfully", "libraryId": newLib.ID})
}

func ListLibraries(c *gin.Context) {
	var libraries []models.Library
	if err := config.DB.Find(&libraries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch libraries"})
		return
	}

	var result []gin.H
	for _, lib := range libraries {
		var count int64
		config.DB.Model(&models.Book{}).Where("lib_id = ?", lib.ID).Count(&count)
		result = append(result, gin.H{
			"id":       lib.ID,
			"name":     lib.Name,
			"numBooks": count,
		})
	}

	c.JSON(http.StatusOK, gin.H{"libraries": result})
}