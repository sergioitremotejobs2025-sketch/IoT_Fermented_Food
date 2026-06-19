package helper

import (
	"os"
	"unicode"
)

// GetEnv get env variable or default value
func GetEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}

	return defaultValue
}

// ValidatePassword returns true if password is at least 8 characters, has a digit, and an uppercase letter.
func ValidatePassword(password string) bool {
	if len(password) < 8 {
		return false
	}
	var hasUpper, hasDigit bool
	for _, char := range password {
		if unicode.IsUpper(char) {
			hasUpper = true
		}
		if unicode.IsDigit(char) {
			hasDigit = true
		}
	}
	return hasUpper && hasDigit
}
