package handlers

import (
	"net/http"
	"strconv"
	"time"

	"lms/backend/config"
	"lms/backend/middlewares"
	"lms/backend/models"

	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
)

// JSON payload for onboarding a LibraryAdmin.
type CreateAdminRequest struct {
	Name          string `json:"name" binding:"required"`
	Email         string `json:"email" binding:"required,email"`
	ContactNumber string `json:"contactNumber"`
}

func CreateAdmin(c *gin.Context) {
	userInterface, exists := c.Get(string(middlewares.UserContextKey))
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	owner := userInterface.(middlewares.User)
	if owner.Role != "Owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only the library owner can create an admin"})
		return
	}

	var req CreateAdminRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	newAdmin := models.User{
		Name:          req.Name,
		Email:         req.Email,
		ContactNumber: req.ContactNumber,
		Role:          "LibraryAdmin",
		LibID:         owner.LibID,
	}
	if err := config.DB.Create(&newAdmin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create admin user"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Library admin created successfully", "admin": newAdmin})
}

// AddBookRequest defines the payload for adding a book.
type AddBookRequest struct {
	ISBN      string `json:"ISBN" binding:"required"`
	Title     string `json:"Title" binding:"required"`
	Authors   string `json:"Authors" binding:"required"`
	Publisher string `json:"Publisher"`
	Version   string `json:"Version"`
	Copies    int    `json:"Copies" binding:"required,gt=0"`
}

// AddBook adds a new book or increments copies if it already exists.
/*func AddBook(c *gin.Context) {
	var req AddBookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid required book fields"})
		return
	}

	user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
	libID := user.LibID

	var book models.Book
	err := config.DB.Where("isbn = ? AND lib_id = ?", req.ISBN, libID).First(&book).Error
	if err != nil {
		// Create a new record if not found.
		newBook := models.Book{
			ISBN:            req.ISBN,
			LibID:           libID,
			Title:           req.Title,
			Authors:         req.Authors,
			Publisher:       req.Publisher,
			Version:         req.Version,
			TotalCopies:     req.Copies,
			AvailableCopies: req.Copies,
		}
		if err := config.DB.Create(&newBook).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error adding new book"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Book added successfully"})
		return
	} else {
		// Increment copies if book exists.
		book.TotalCopies += req.Copies
		book.AvailableCopies += req.Copies
		if err := config.DB.Save(&book).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error updating book copies"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Book copies updated"})
	}
}*/

func AddBook(c *gin.Context) {
	var req AddBookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid required book fields"})
		return
	}

	user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
	libID := user.LibID

	var book models.Book
	// Query only by ISBN to enforce global uniqueness.
	err := config.DB.Where("isbn = ?", req.ISBN).First(&book).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// No book with this ISBN exists at all, create a new record.
			newBook := models.Book{
				ISBN:            req.ISBN,
				LibID:           libID,
				Title:           req.Title,
				Authors:         req.Authors,
				Publisher:       req.Publisher,
				Version:         req.Version,
				TotalCopies:     req.Copies,
				AvailableCopies: req.Copies,
			}
			if err := config.DB.Create(&newBook).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error adding new book"})
				return
			}
			c.JSON(http.StatusCreated, gin.H{"message": "Book added successfully"})
			return
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error searching for book"})
			return
		}
	}

	// A book with this ISBN was found.
	if book.LibID != libID {
		// The same ISBN exists in a different library.
		c.JSON(http.StatusBadRequest, gin.H{"error": "Book with this ISBN already exists in another library"})
		return
	}
	// Otherwise, the book is in the same library, so update the copies.
	book.TotalCopies += req.Copies
	book.AvailableCopies += req.Copies
	if err := config.DB.Save(&book).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error updating book copies"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Book copies updated"})
}

// Payload for remove a book
type RemoveBookRequest struct {
	CopiesToRemove int `json:"CopiesToRemove" binding:"required,gt=0"`
}

func RemoveBook(c *gin.Context) {
	isbn := c.Param("isbn")
	var req RemoveBookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
	libID := user.LibID

	var book models.Book
	if err := config.DB.Where("isbn = ? AND lib_id = ?", isbn, libID).First(&book).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}
	if req.CopiesToRemove > book.AvailableCopies {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot remove copies that are issued"})
		return
	}
	book.TotalCopies -= req.CopiesToRemove
	book.AvailableCopies -= req.CopiesToRemove
	if book.TotalCopies == 0 {
		if err := config.DB.Delete(&book).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error deleting book"})
			return
		}
	} else {
		if err := config.DB.Save(&book).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error updating book copies"})
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "Book copies removed successfully"})
}

// UpdateBook updates book details dynamically.
func UpdateBook(c *gin.Context) {
	isbn := c.Param("isbn")
	user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
	libID := user.LibID

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	if len(updateData) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No update fields provided"})
		return
	}
	if err := config.DB.Model(&models.Book{}).Where("isbn = ? AND lib_id = ?", isbn, libID).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error updating book"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Book details updated successfully"})
}

// ListIssueRequests lists all issue requests for the library.
/*
func ListIssueRequests(c *gin.Context) {
	user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
	libID := user.LibID

	var requests []models.RequestEvent
	if err := config.DB.Raw(`
        SELECT r.*
        FROM request_events r
        JOIN books b ON r.book_id = b.isbn
        WHERE b.lib_id = ?`, libID).Scan(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error fetching requests"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"requests": requests})
}*/
func ListIssueRequests(c *gin.Context) {
	user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
	libID := user.LibID

	var requests []models.RequestEvent
	// Use a join to filter requests for this library with no approval_date (i.e., pending)
	err := config.DB.Joins("JOIN books ON books.isbn = request_events.book_id").
		Where("books.lib_id = ? AND request_events.approval_date IS NULL", libID).
		Find(&requests).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error fetching requests"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"requests": requests})
}

func ApproveIssueRequest(c *gin.Context) {
	reqIDStr := c.Param("reqid")
	reqID, err := strconv.Atoi(reqIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}
	user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
	libID := user.LibID

	tx := config.DB.Begin()

	var reqEvent models.RequestEvent
	if err := tx.Where("id = ?", reqID).First(&reqEvent).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}
	// Prevent processing an already approved or rejected request.
	if reqEvent.ApprovalDate != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Request already processed"})
		return
	}

	var book models.Book
	if err := tx.Where("isbn = ? AND lib_id = ?", reqEvent.BookID, libID).First(&book).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking book availability"})
		return
	}
	if book.AvailableCopies <= 0 {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "Book not available for issue"})
		return
	}

	// Check if the user already has an active issue for the same book.
	var activeIssue models.IssueRegistry
	if err := tx.Where("isbn = ? AND reader_id = ? AND issue_status = ?", reqEvent.BookID, reqEvent.ReaderID, "Issued").
		First(&activeIssue).Error; err == nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already has an active issue for this book"})
		return
	}

	now := time.Now()
	if err := tx.Model(&reqEvent).Updates(models.RequestEvent{
		ApprovalDate: &now,
		ApproverID:   &user.ID,
	}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating request"})
		return
	}

	expectedReturn := time.Now().AddDate(0, 0, 14)
	issue := models.IssueRegistry{
		ISBN:               reqEvent.BookID,
		ReaderID:           reqEvent.ReaderID,
		IssueApproverID:    &user.ID,
		IssueStatus:        "Issued",
		IssueDate:          time.Now(),
		ExpectedReturnDate: expectedReturn,
	}
	if err := tx.Create(&issue).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating issue record"})
		return
	}
	book.AvailableCopies -= 1
	if err := tx.Save(&book).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating book inventory"})
		return
	}
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Issue request approved and book issued"})
}


// RejectIssueRequest marks an issue request as rejected.
/*
func RejectIssueRequest(c *gin.Context) {
	reqIDStr := c.Param("reqid")
	reqID, err := strconv.Atoi(reqIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}
	user := c.MustGet(string(middlewares.UserContextKey)).(middlewares.User)
	now := time.Now()
	if err := config.DB.Model(&models.RequestEvent{}).Where("id = ?", reqID).Updates(models.RequestEvent{ApprovalDate: &now, ApproverID: &user.ID}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error rejecting request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Issue request rejected"})
}

/*
func RejectIssueRequest(c *gin.Context) {
    reqIDStr := c.Param("reqid")
    reqID, err := strconv.Atoi(reqIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
        return
    }

    // Delete the request from the database so that it won't show up again.
    if err := config.DB.Delete(&models.RequestEvent{}, reqID).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error rejecting request"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Issue request rejected and removed"})
}
*/
func RejectIssueRequest(c *gin.Context) {
	reqIDStr := c.Param("reqid")
	reqID, err := strconv.Atoi(reqIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}

	// Use Unscoped deletion to permanently remove the record.
	if err := config.DB.Unscoped().Delete(&models.RequestEvent{}, reqID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error deleting request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Issue request rejected and deleted"})
}
