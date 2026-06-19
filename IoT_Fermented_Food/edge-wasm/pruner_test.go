package main

import (
	"testing"
)

func TestShouldKeep(t *testing.T) {
	tests := []struct {
		name       string
		current    float64
		last       float64
		shouldKeep bool
	}{
		{
			name:       "Difference exactly 0.2",
			current:    20.2,
			last:       20.0,
			shouldKeep: true,
		},
		{
			name:       "Difference exactly -0.2",
			current:    19.8,
			last:       20.0,
			shouldKeep: true,
		},
		{
			name:       "Difference less than 0.2 (positive)",
			current:    20.19,
			last:       20.0,
			shouldKeep: false,
		},
		{
			name:       "Difference less than 0.2 (negative)",
			current:    19.81,
			last:       20.0,
			shouldKeep: false,
		},
		{
			name:       "Difference greater than 0.2",
			current:    25.0,
			last:       20.0,
			shouldKeep: true,
		},
		{
			name:       "No difference",
			current:    20.0,
			last:       20.0,
			shouldKeep: false,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result := ShouldKeep(tc.current, tc.last)
			if result != tc.shouldKeep {
				t.Errorf("Expected %v but got %v for current=%f, last=%f", tc.shouldKeep, result, tc.current, tc.last)
			}
		})
	}
}
