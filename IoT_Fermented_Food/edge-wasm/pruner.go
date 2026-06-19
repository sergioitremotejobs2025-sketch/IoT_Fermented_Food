//go:build js && wasm
package main

import (
	"fmt"
	"math"
	"syscall/js"
)

// DataPruner checks if a sensor reading should be sent to the cloud.
// It implements a simple "Delta-Threshold" algorithm to reduce ingestion costs.
func DataPruner(this js.Value, args []js.Value) interface{} {
	if len(args) < 2 {
		return js.ValueOf(true) // Send if we don't have comparison data
	}

	currentValue := args[0].Float()
	lastValue := args[1].Float()
	threshold := 0.2 // Configurable threshold for "significant change"

	delta := math.Abs(currentValue - lastValue)
	
	if delta < threshold {
		// Prune this packet: the change is negligible
		return js.ValueOf(false) 
	}

	// Signficant change detected: send to cloud
	return js.ValueOf(true) 
}

func main() {
	done := make(chan struct{})
	fmt.Println("🚀 IoT Edge: Wasm Data Pruner Initialized")
	
	// Register the function to the global JS context
	js.Global().Set("dataPruner", js.FuncOf(DataPruner))
	
	<-done
}
