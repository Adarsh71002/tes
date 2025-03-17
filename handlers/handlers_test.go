// handlers_test.go
package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"regexp"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"github.com/stretchr/testify/assert"

	"lms/backend/config"
	"lms/backend/middlewares"
	//"lms/backend/handlers"
	//"lms/backend/handlers"
)

// setupTestDB creates a new mock database and assigns it to config.DB.
func setupTestDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock database: %v", err)
	}
	gdb, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open gorm DB: %v", err)
	}
	// Assign the mock DB to the global config
	config.DB = gdb
	return gdb, mock
}

// CreateAdmin Tests

// Test when no user is present in context.
func TestCreateAdmin_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Create an empty request without setting any user in the context.
	req, _ := http.NewRequest("POST", "/api/owner/admin/create", nil)
	c.Request = req

	// Call the handler.
	CreateAdmin(c)

	// Assert response code.
	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401 Unauthorized, got %d", w.Code)
	}

	// Optional: Validate the error message in the response body.
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	if response["error"] != "Unauthorized" {
		t.Errorf("expected error message 'Unauthorized', got '%s'", response["error"])
	}
}

// Test when user role is not Owner.
func TestCreateAdmin_Forbidden(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Create a valid request body for testing.
	reqBody := map[string]string{
		"name":           "Admin",
		"email":          "admin@example.com",
		"contact_number": "12345",
	}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/owner/admin/create", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Set a user with a non-owner role in the context.
	nonOwner := middlewares.User{
		ID:    2,
		Name:  "ReaderUser",
		Email: "reader@example.com",
		Role:  "Reader", // Not "Owner".
		LibID: 1,
	}
	c.Set(string(middlewares.UserContextKey), nonOwner)

	// Call the handler.
	CreateAdmin(c)

	// Assert response code and expected output.
	if w.Code != http.StatusForbidden {
		t.Errorf("expected 403 Forbidden, got %d", w.Code)
	}

	// Optional: Validate error message in the response body.
	var response map[string]string
	json.Unmarshal(w.Body.Bytes(), &response)
	if response["error"] != "Only the library owner can create an admin" {
		t.Errorf("expected error message 'Only the library owner can create an admin', got '%s'", response["error"])
	}
}

// Test successful creation of admin.
func TestCreateAdmin_Success(t *testing.T) {
	// Setup test DB using SQLMock.
	_, mock := setupTestDB(t)

	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Prepare a valid request payload.
	reqBody := CreateAdminRequest{
		Name:          "Admin",
		Email:         "admin@example.com",
		ContactNumber: "1234567890",
	}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/owner/admin/create", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Set a user with the Owner role in the context.
	ownerUser := middlewares.User{
		ID:    1,
		Name:  "OwnerUser",
		Email: "owner@example.com",
		Role:  "Owner",
		LibID: 1,
	}
	c.Set(string(middlewares.UserContextKey), ownerUser)

	// Expect a database transaction for creating the new admin.
	mock.ExpectBegin()
	// GORM uses a Query with a RETURNING clause for inserts on Postgres.
	mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO "users" ("created_at","updated_at","deleted_at","name","email","contact_number","role","lib_id") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING "id"`)).
		WithArgs(
			sqlmock.AnyArg(), // created_at
			sqlmock.AnyArg(), // updated_at
			sqlmock.AnyArg(), // deleted_at, should be nil
			reqBody.Name,
			reqBody.Email,
			reqBody.ContactNumber,
			"LibraryAdmin",   // Role for the new admin.
			ownerUser.LibID,
		).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectCommit()

	// Call the handler.
	CreateAdmin(c)

	// Assert that the response code is 201 Created.
	assert.Equal(t, http.StatusCreated, w.Code)

	// Unmarshal the JSON response.
	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "Library admin created successfully", resp["message"])

	// Check that the returned admin data contains the expected values.
	adminData, ok := resp["admin"].(map[string]interface{})
	assert.True(t, ok)
	assert.Equal(t, reqBody.Name, adminData["Name"])
	assert.Equal(t, reqBody.Email, adminData["Email"])

	// Verify that all SQLMock expectations were met.
	assert.NoError(t, mock.ExpectationsWereMet())
}

// ----------------------
// CreateReader Tests
// ----------------------
/*

*/
// ----------------------
// CreateLibrary Tests
// ----------------------
func TestCreateLibrary_Success(t *testing.T) {
	// Setup test DB using SQLMock.
	_, mock := setupTestDB(t)

	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Prepare a valid request payload.
	reqPayload := CreateLibraryRequest{
		LibraryName:  "Test Library",
		OwnerName:    "Owner Name",
		OwnerEmail:   "owner@example.com",
		OwnerContact: "1234567890",
	}
	payload, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest("POST", "/api/library/create", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// ---- Expectation: Check if library already exists ----
	// GORM will generate a query similar to:
	// SELECT * FROM "libraries" WHERE name = $1 AND "libraries"."deleted_at" IS NULL ORDER BY "libraries"."id" LIMIT $2
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "libraries" WHERE name = $1 AND "libraries"."deleted_at" IS NULL ORDER BY "libraries"."id" LIMIT $2`)).
		WithArgs(reqPayload.LibraryName, 1).
		WillReturnError(gorm.ErrRecordNotFound)

	// ---- Expectation: Insert the new library ----
	// GORM generates an INSERT with RETURNING clause for Postgres.
	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO "libraries" ("created_at","updated_at","deleted_at","name") VALUES ($1,$2,$3,$4) RETURNING "id"`)).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), reqPayload.LibraryName).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectCommit()

	// ---- Expectation: Create the owner user ----
	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO "users" ("created_at","updated_at","deleted_at","name","email","contact_number","role","lib_id") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING "id"`)).
		WithArgs(
			sqlmock.AnyArg(), // created_at
			sqlmock.AnyArg(), // updated_at
			sqlmock.AnyArg(), // deleted_at (should be nil)
			reqPayload.OwnerName,
			reqPayload.OwnerEmail,
			reqPayload.OwnerContact,
			"Owner", // role for the owner
			1,       // library ID from the inserted library
		).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectCommit()

	// Call the handler.
	CreateLibrary(c)

	// Assert that the response code is 201 Created.
	assert.Equal(t, http.StatusCreated, w.Code)

	// Decode the JSON response.
	var resp map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "Library created successfully", resp["message"])
	// Check that the returned libraryId is correct.
	assert.Equal(t, float64(1), resp["libraryId"]) // JSON numbers decode as float64

	// Verify that all SQL mock expectations were met.
	assert.NoError(t, mock.ExpectationsWereMet())
}  

// Test duplicate library case.
func TestCreateLibrary_Duplicate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t) // Assuming you have a setupTestDB function to set up mock DB

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqBody := map[string]string{
		"libraryName":  "Test Library",
		"OwnerName":    "Owner",
		"ownerEmail":   "owner@example.com",
		"ownerContact": "1234567890",
	}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/library/create", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Expect a query that finds an existing library.
	rows := sqlmock.NewRows([]string{"id", "name"}).AddRow(1, "Test Library")
	mock.ExpectQuery(`SELECT \* FROM "libraries" WHERE name = \$1 AND "libraries"."deleted_at" IS NULL ORDER BY "libraries"."id" LIMIT \$2`).
		WithArgs(reqBody["libraryName"], 1).
		WillReturnRows(rows)

	CreateLibrary(c)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", w.Code)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}

// ----------------------
// AddBook Tests
// ----------------------
// Test for invalid payload.
func TestAddBook_InvalidPayload(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Provide an invalid JSON payload (empty or missing required fields).
	req, _ := http.NewRequest("POST", "/api/admin/books", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Set a valid user in context.
	user := middlewares.User{ID: 1, LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	AddBook(c)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var resp map[string]string
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, "Missing or invalid required book fields", resp["error"])
}

// Test for creating a new book when no book exists with the given ISBN.
func TestAddBook_New(t *testing.T) {
	_, mock := setupTestDB(t)
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Set a valid user in the context.
	user := middlewares.User{ID: 1, LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	// Prepare a valid request payload.
	reqPayload := AddBookRequest{
		ISBN:      "12345",
		Title:     "Test Book",
		Authors:   "Author1, Author2",
		Publisher: "Test Publisher",
		Version:   "1st Edition",
		Copies:    5,
	}
	payload, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest("POST", "/api/admin/books", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Expect a SELECT query for the book by ISBN including ORDER BY and LIMIT.
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "books" WHERE isbn = $1 ORDER BY "books"."isbn" LIMIT $2`)).
		WithArgs(reqPayload.ISBN, 1).
		WillReturnError(gorm.ErrRecordNotFound)

	// Expect an INSERT query for creating the new book.
	// GORM is using Exec (without RETURNING clause) in this case.
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta(`INSERT INTO "books" ("isbn","lib_id","title","authors","publisher","version","total_copies","available_copies") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`)).
		WithArgs(
			reqPayload.ISBN,
			user.LibID,
			reqPayload.Title,
			reqPayload.Authors,
			reqPayload.Publisher,
			reqPayload.Version,
			reqPayload.Copies,
			reqPayload.Copies,
		).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	// Call the handler.
	AddBook(c)

	// Assert that the response code is 201 Created.
	assert.Equal(t, http.StatusCreated, w.Code)

	var resp map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "Book added successfully", resp["message"])
	assert.NoError(t, mock.ExpectationsWereMet())
}

// Test for existing book in a different library.
func TestAddBook_Exists_DifferentLibrary(t *testing.T) {
	_, mock := setupTestDB(t)
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Set a valid user in context.
	user := middlewares.User{ID: 1, LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	reqPayload := AddBookRequest{
		ISBN:      "12345",
		Title:     "Test Book",
		Authors:   "Author1",
		Publisher: "Test Publisher",
		Version:   "1st Edition",
		Copies:    5,
	}
	payload, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest("POST", "/api/admin/books", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Simulate an existing book with the same ISBN but from a different library.
	rows := sqlmock.NewRows([]string{
		"isbn", "lib_id", "title", "authors", "publisher", "version", "total_copies", "available_copies",
	}).AddRow(reqPayload.ISBN, 2, reqPayload.Title, reqPayload.Authors, reqPayload.Publisher, reqPayload.Version, 10, 10)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "books" WHERE isbn = $1 ORDER BY "books"."isbn" LIMIT $2`)).
		WithArgs(reqPayload.ISBN, 1).
		WillReturnRows(rows)

	// Call the handler.
	AddBook(c)

	// Assert that a 400 Bad Request is returned.
	assert.Equal(t, http.StatusBadRequest, w.Code)

	var resp map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "Book with this ISBN already exists in another library", resp["error"])
	assert.NoError(t, mock.ExpectationsWereMet())
}

// Test for updating an existing book in the same library.
func TestAddBook_Exists_SameLibrary(t *testing.T) {
	_, mock := setupTestDB(t)
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Set a valid user in the context.
	user := middlewares.User{ID: 1, LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	reqPayload := AddBookRequest{
		ISBN:      "12345",
		Title:     "Test Book",
		Authors:   "Author1",
		Publisher: "Test Publisher",
		Version:   "1st Edition",
		Copies:    5,
	}
	payload, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest("POST", "/api/admin/books", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Expect a SELECT query that looks for a book with this ISBN.
	// GORM generates a query with ORDER BY and LIMIT two parameters.
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "books" WHERE isbn = $1 ORDER BY "books"."isbn" LIMIT $2`)).
		WithArgs(reqPayload.ISBN, 1).
		WillReturnRows(
			sqlmock.NewRows([]string{"isbn", "lib_id", "total_copies", "available_copies"}).
				AddRow(reqPayload.ISBN, user.LibID, 10, 10),
		)

	// Since the book exists in the same library, the handler updates the copies.
	// GORM's Save method will update all fields. In our case, since title, authors, publisher,
	// and version were not returned by the SELECT, their values are zero (empty string).
	mock.ExpectBegin()
	mock.ExpectExec(regexp.QuoteMeta(
		`UPDATE "books" SET "title"=$1,"authors"=$2,"publisher"=$3,"version"=$4,"total_copies"=$5,"available_copies"=$6 WHERE "isbn" = $7 AND "lib_id" = $8`,
	)).
		WithArgs("", "", "", "", 15, 15, reqPayload.ISBN, user.LibID).
		WillReturnResult(sqlmock.NewResult(1, 1))
	
	mock.ExpectCommit()

	// Call the handler.
	AddBook(c)

	// Assert that the response code is 200 OK.
	assert.Equal(t, http.StatusOK, w.Code)

	var resp map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, "Book copies updated", resp["message"])
	assert.NoError(t, mock.ExpectationsWereMet())
}







/*
func TestAddBook_DuplicateISBN(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t) // Ensure this correctly sets up the mock database

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqBody := map[string]interface{}{
		"isbn":      "12345",
		"title":     "Test Book",
		"authors":   "John Doe",
		"publisher": "Test Publisher",
		"version":   "1st Edition",
		"copies":    5,
	}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/admin/books", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	// Expect a book with this ISBN exists in a different library.
	rows := sqlmock.NewRows([]string{"isbn", "lib_id", "title", "authors", "publisher", "version", "total_copies", "available_copies"}).
		AddRow(reqBody["isbn"], 2, reqBody["title"], reqBody["authors"], reqBody["publisher"], reqBody["version"], reqBody["copies"], reqBody["copies"])
	mock.ExpectQuery(`SELECT \* FROM "books" WHERE isbn = \$1`).
		WithArgs(reqBody["isbn"]).
		WillReturnRows(rows)

	AddBook(c) // Call the handler.

	// Assert response code.
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", w.Code)
	}

	// Assert unfulfilled expectations in SQL mock.
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}*/



// ----------------------
// RemoveBook Tests
// ----------------------

// Test RemoveBook when the book is not found.func TestRemoveBook_NotFound(t *testing.T) {
func TestRemoveBook_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t) 

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	isbn := "12345"
	reqBody := map[string]int{"CopiesToRemove": 1}
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("DELETE", "/api/admin/books/"+isbn, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Params = append(c.Params, gin.Param{Key: "isbn", Value: isbn}) // Ensure the ISBN parameter is set
	c.Request = req

	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	// Expect a book lookup query.
	mock.ExpectQuery(`SELECT \* FROM "books" WHERE isbn = \$1 AND lib_id = \$2 ORDER BY "books"."isbn" LIMIT \$3`).
		WithArgs(isbn, user.LibID, 1).
		WillReturnError(gorm.ErrRecordNotFound)

	RemoveBook(c) // Call the handler.

	// Assert response code.
	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404 Not Found, got %d", w.Code)
	}

	// Assert unfulfilled expectations in SQL mock.
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}

// ----------------------
// UpdateBook Tests
// ----------------------

// Test UpdateBook with no update fields provided.
func TestUpdateBook_NoFields(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	isbn := "12345"
	reqBody := map[string]interface{}{} // empty update data
	body, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("PUT", "/api/admin/books/"+isbn, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	UpdateBook(c)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", w.Code)
	}
}

// ----------------------
// ListIssueRequests Tests
// ----------------------

// Test ListIssueRequests when DB returns an error.
func TestListIssueRequests_Error(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t) // Ensure this correctly sets up the mock database

	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)
	req, _ := http.NewRequest("GET", "/api/admin/requests", nil)
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Expect a library lookup query.
	mock.ExpectQuery(`SELECT r\.\* FROM request_events r JOIN books b ON r.book_id = b.isbn WHERE b.lib_id = \$1 AND r\.deleted_at IS NULL`).
		WithArgs(user.LibID).
		WillReturnError(gorm.ErrInvalidTransaction)

	ListIssueRequests(c) // Call the handler.

	// Assert response code.
	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected 500 Internal Server Error, got %d", w.Code)
	}

	// Assert unfulfilled expectations in SQL mock.
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %v", err)
	}
}

// ----------------------
// ApproveIssueRequest Tests
// ----------------------

// Test ApproveIssueRequest when book is unavailable.
func TestApproveIssueRequest_BookUnavailable(t *testing.T) {
	gin.SetMode(gin.TestMode)
	_, mock := setupTestDB(t)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	reqIDStr := "1"
	req, _ := http.NewRequest("POST", "/api/admin/requests/"+reqIDStr+"/approve", nil)
	c.Request = req

	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	// Return a request event with nil ApprovalDate.
	rowsReq := sqlmock.NewRows([]string{"id", "book_id", "reader_id", "approval_date"}).
		AddRow(1, "12345", 2, nil)
	mock.ExpectQuery(`SELECT \* FROM request_events WHERE id = \?`).
		WithArgs(reqIDStr).
		WillReturnRows(rowsReq)

	// Return a book with available copies 0.
	rowsBook := sqlmock.NewRows([]string{"isbn", "lib_id", "available_copies"}).
		AddRow("12345", user.LibID, 0)
	mock.ExpectQuery(`SELECT \* FROM books WHERE isbn = \? AND lib_id = \?`).
		WithArgs("12345", user.LibID).
		WillReturnRows(rowsBook)

	ApproveIssueRequest(c)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", w.Code)
	}
}

// ----------------------
// RejectIssueRequest Tests
// ----------------------

// Test RejectIssueRequest with invalid request ID.
func TestRejectIssueRequest_InvalidReqID(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	req, _ := http.NewRequest("POST", "/api/admin/requests/abc/reject", nil)
	c.Request = req

	user := middlewares.User{ID: 1, Name: "Admin", Email: "admin@example.com", Role: "LibraryAdmin", LibID: 1}
	c.Set(string(middlewares.UserContextKey), user)

	RejectIssueRequest(c)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", w.Code)
	}
}

// ----------------------
// SignIn Tests
// ----------------------

/*
// Test SignIn when user is not found.

	func TestSignIn_UserNotFound(t *testing.T) {
		gin.SetMode(gin.TestMode)
		_, mock := setupTestDB(t)
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		reqBody := map[string]string{"email": "nonexistent@example.com"}
		body, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/api/signin", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		c.Request = req

		mock.ExpectQuery(`SELECT \* FROM users WHERE email = \?`).
			WithArgs(reqBody["email"]).
			WillReturnError(gorm.ErrRecordNotFound)

		SignIn(c)
		if w.Code != http.StatusUnauthorized {
			t.Errorf("expected 401 Unauthorized, got %d", w.Code)
		}
	}

// Test successful SignIn.

	func TestSignIn_Success(t *testing.T) {
		gin.SetMode(gin.TestMode)
		_, mock := setupTestDB(t)
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		reqBody := map[string]string{"email": "user@example.com"}
		body, _ := json.Marshal(reqBody)
		req, _ := http.NewRequest("POST", "/api/signin", bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		c.Request = req

		rows := sqlmock.NewRows([]string{"id", "name", "email", "contact_number", "role", "lib_id"}).
			AddRow(1, "Test User", reqBody["email"], "123456", "Reader", 1)
		mock.ExpectQuery(`SELECT * FROM "users" WHERE email = $1 AND "users"."deleted_at" IS NULL ORDER BY "users"."id" LIMIT $2`).
			WithArgs(reqBody["email"]).
			WillReturnRows(rows)

		SignIn(c)
		if w.Code != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", w.Code)
		}
	}
*/
func TestCreateReader_InvalidPayload(t *testing.T) {
	// Setup test DB (not used here since binding fails).
	_, _ = setupTestDB(t)

	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// An invalid payload: empty name, invalid email, and missing required fields.
	reqBody := `{"name": "", "email": "invalid", "lib_id": 0}`
	req, _ := http.NewRequest("POST", "/api/reader/create", bytes.NewBufferString(reqBody))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Call the handler.
	CreateReader(c)

	// Assert that the status code is 400 Bad Request.
	assert.Equal(t, http.StatusBadRequest, w.Code)

	// Verify that the response body contains the expected error message.
	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Invalid request payload", response["error"])
}

// TestCreateReader_InvalidLibrary verifies that a non-existent library ID results in a 400 response.
func TestCreateReader_InvalidLibrary(t *testing.T) {
	_, mock := setupTestDB(t)

	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Prepare a valid request payload but with a library id that does not exist.
	reqPayload := CreateReaderRequest{
		Name:          "John Doe",
		Email:         "john@example.com",
		ContactNumber: "1234567890",
		LibID:         999, // Assume this library ID does not exist.
	}
	payload, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest("POST", "/api/reader/create", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Expect a SELECT query to check for the library. No rows will be returned.
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "libraries" WHERE id = $1 AND "libraries"."deleted_at" IS NULL ORDER BY "libraries"."id" LIMIT $2`)).
    WithArgs(reqPayload.LibID, 1).
    WillReturnRows(sqlmock.NewRows([]string{"id"}))
 // Empty result set.

	// Call the handler.
	CreateReader(c)

	// Assert that the response code is 400.
	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Invalid library id", response["error"])

	// Ensure all expectations were met.
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestCreateReader_Success(t *testing.T) {
	_, mock := setupTestDB(t)

	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Prepare a valid request payload.
	reqPayload := CreateReaderRequest{
		Name:          "Alice",
		Email:         "alice@example.com",
		ContactNumber: "9876543210",
		LibID:         1,
	}
	payload, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest("POST", "/api/reader/create", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	c.Request = req

	// Expect a SELECT query to check if the library exists.
	libRows := sqlmock.NewRows([]string{"id"}).AddRow(reqPayload.LibID)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "libraries" WHERE id = $1 AND "libraries"."deleted_at" IS NULL ORDER BY "libraries"."id" LIMIT $2`)).
		WithArgs(reqPayload.LibID, 1).
		WillReturnRows(libRows)

	// Expect an INSERT query to create the new reader.
	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`INSERT INTO "users" ("created_at","updated_at","deleted_at","name","email","contact_number","role","lib_id") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING "id"`)).
		WithArgs(
			sqlmock.AnyArg(), // created_at
			sqlmock.AnyArg(), // updated_at
			sqlmock.AnyArg(), // deleted_at (should be nil)
			reqPayload.Name,
			reqPayload.Email,
			reqPayload.ContactNumber,
			"Reader",
			reqPayload.LibID,
		).
		WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
	mock.ExpectCommit()

	// Call the handler.
	CreateReader(c)

	// Assert that the response code is 201 Created.
	assert.Equal(t, http.StatusCreated, w.Code)

	// Decode and verify the JSON response.
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Reader created successfully", response["message"])

	// Optionally, verify that the reader object in the response has the expected values.
	readerData, ok := response["reader"].(map[string]interface{})
	assert.True(t, ok)
	assert.Equal(t, reqPayload.Name, readerData["Name"])
	assert.Equal(t, reqPayload.Email, readerData["Email"])

	assert.NoError(t, mock.ExpectationsWereMet())
}


