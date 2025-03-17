package handlers

import (
	"net/http"

	"lms/backend/config"
	"lms/backend/models"

	"github.com/gin-gonic/gin"
)

// SignInRequest defines the payload for sign in.
type SignInRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// SignIn checks if a user exists and returns the user object.
func SignIn(c *gin.Context) {
	var req SignInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
