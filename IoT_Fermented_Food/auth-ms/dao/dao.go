package dao

import (
	"auth-ms/helper"
	"auth-ms/model"

	"database/sql"
	"fmt"
	"log"
)

// MysqlRepository is the production implementation of Repository backed by MySQL.
type MysqlRepository struct {
	DB *sql.DB
}

// NewMysqlRepository creates a production MySQL-backed repository.
func NewMysqlRepository() Repository {
	return &MysqlRepository{}
}

func (r *MysqlRepository) getDB() *sql.DB {
	if r.DB == nil {
		r.DB = connect()
	}
	return r.DB
}

// connect Connect to MySQL Server
func connect() *sql.DB {
	user := helper.GetEnv("MYSQL_ROOT_USERNAME", "root")
	password := helper.GetEnv("MYSQL_ROOT_PASSWORD", "my-secret-pw")
	host := helper.GetEnv("MYSQL_HOSTNAME", "192.168.1.222")
	port := helper.GetEnv("MYSQL_SERVICE_PORT", "31000")
	database := helper.GetEnv("MYSQL_DATABASE_NAME", "iot")

	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", user, password, host, port, database))

	if err != nil {
		log.Println("SQL Open error:", err.Error())
	}

	return db
}

// Exists checks whether user credentials exist in the DB.
func (r *MysqlRepository) Exists(user model.User) (bool, model.User) {
	db := r.getDB()
	// No defer db.Close() because we want to reuse it if it's injected/pooled?
	// But in the original it was defer db.Close().
	// If it's a real connect(), we should close it.
	// If it's a mock, we don't want to close it prematurely if we use it for multiple calls.
	// But the original code was defer db.Close() after calling connect().

	pStmt, err := db.Prepare("SELECT * FROM iot.users WHERE username = ? AND password = ?")
	if err != nil {
		log.Println("SQL Prepare error (Exists):", err.Error())
		return false, model.User{}
	}
	defer pStmt.Close()

	var dbUser model.User
	err = pStmt.QueryRow(user.Username, user.Password).Scan(&dbUser.Username, &dbUser.Password, &dbUser.RefreshToken)
	existUser := user.Username == dbUser.Username && user.Password == dbUser.Password
	if err != nil {
		existUser = false
		log.Println("User '" + user.Username + "' and password '***' not found in the DB")
	}

	return existUser, dbUser
}

// Insert adds new user credentials in the DB.
func (r *MysqlRepository) Insert(user model.User) bool {
	db := r.getDB()
	pStmt, err := db.Prepare("INSERT INTO iot.users VALUES (?, ?, ?)")
	if err != nil {
		log.Println("SQL Prepare error (Insert):", err.Error())
		return false
	}
	defer pStmt.Close()

	_, err = pStmt.Exec(user.Username, user.Password, user.RefreshToken)
	if err != nil {
		log.Println("The user inserted is already registered")
		return false
	}
	return true
}

// Update updates user credentials in the DB.
func (r *MysqlRepository) Update(credentials model.Credential) int64 {
	db := r.getDB()
	pStmt, err := db.Prepare("UPDATE iot.users SET refresh_token = ? WHERE refresh_token = ? AND username = ?")
	if err != nil {
		log.Println("SQL Prepare error (Update):", err.Error())
		return 0
	}
	defer pStmt.Close()

	result, err := pStmt.Exec(credentials.NewRefreshToken, credentials.RefreshToken, credentials.Username)
	if err != nil {
		log.Println("The transaction failed")
		return 0
	}
	rows, _ := result.RowsAffected()
	return rows
}

// UpdatePassword updates the user's password in the DB.
func (r *MysqlRepository) UpdatePassword(username string, newPassword string) bool {
	db := r.getDB()
	pStmt, _ := db.Prepare("UPDATE iot.users SET password = ? WHERE username = ?")
	if pStmt != nil {
		defer pStmt.Close()
	} else {
		return false
	}

	_, err := pStmt.Exec(newPassword, username)
	if err != nil {
		log.Println("Failed to update password for user:", username)
		return false
	}
	return true
}
