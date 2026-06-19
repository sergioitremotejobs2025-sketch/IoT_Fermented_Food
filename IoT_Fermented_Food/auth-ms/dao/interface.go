package dao

import "auth-ms/model"

// Repository defines all database operations for the auth service.
// This interface allows mocking in tests without a real MySQL connection.
type Repository interface {
	Exists(user model.User) (bool, model.User)
	Insert(user model.User) bool
	Update(credentials model.Credential) int64
	UpdatePassword(username string, newPassword string) bool
}
