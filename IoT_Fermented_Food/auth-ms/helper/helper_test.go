package helper

import (
	"os"
	"testing"
)

func TestGetEnv(t *testing.T) {
	// Test default value
	key := "NON_EXISTENT_KEY_123"
	expected := "default"
	got := GetEnv(key, expected)
	if got != expected {
		t.Errorf("expected %q, got %q", expected, got)
	}

	// Test existing env var
	key = "EXISTENT_KEY_123"
	expected = "real_value"
	os.Setenv(key, expected)
	defer os.Unsetenv(key)

	got = GetEnv(key, "something_else")
	if got != expected {
		t.Errorf("expected %q, got %q", expected, got)
	}
}
