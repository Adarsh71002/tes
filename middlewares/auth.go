package middlewares

import (
	"net/http"
	"strings"

	"lms/backend/config"
	"lms/backend/models"

	"github.com/gin-gonic/gin"
)

// ContextKey is used to set/retrieve values from Gin's context.
type ContextKey string

const UserContextKey ContextKey = "user"

// User is the minimal user type used in middleware.
type User struct {
	ID            uint
	Name          string
	Email         string
	ContactNumber string
	Role          string
	LibID         uint
}

// AuthMiddleware checks for the X-User-Email header and loads the user record.
func AuthMiddleware(c *gin.Context) {
	email := c.GetHeader("X-User-Email")
	if strings.TrimSpace(email) == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Email header missing"})
		c.Abort()
		return
	}
	var user models.User
	if err := config.DB.Where("email = ?", email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: User not found"})
		c.Abort()
		return
	}
	mwUser := User{
		ID:            user.ID,
		Name:          user.Name,
		Email:         user.Email,
		ContactNumber: user.ContactNumber,
		Role:          user.Role,
		LibID:         user.LibID,
	}
	c.Set(string(UserContextKey), mwUser)
	c.Next()
}
