package helper

import "testing"

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		want     bool
	}{
		{"Too short", "1234567", false},
		{"Valid min length", "12345678", false},            // fails: no uppercase
		{"Longer valid", "password123", false},             // fails: no uppercase
		{"Valid strong exactly 8 chars", "Passwor1", true}, // Exact boundary (8 chars)
		{"Valid strong", "Password123", true},
		{"No digit", "Password!!", false},
		{"No upper", "password123", false},
		{"Empty", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := ValidatePassword(tt.password); got != tt.want {
				t.Errorf("ValidatePassword() = %v, want %v", got, tt.want)
			}
		})
	}
}
