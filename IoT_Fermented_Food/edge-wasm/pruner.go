package main

import "math"

func ShouldKeep(current, last float64) bool {
	return math.Abs(current-last) >= 0.199999
}
