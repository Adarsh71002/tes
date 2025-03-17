package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func ReaderMiddleware(c *gin.Context) {
	userInterface, exists := c.Get(string(UserContextKey))
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
		return
	}
	user := userInterface.(User)
	if user.Role != "Reader" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Not a reader"})
		c.Abort()
		return
	}
	c.Next()
}
