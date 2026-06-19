//go:build js && wasm

package main

import (
	"syscall/js"
)

func jsShouldKeep(this js.Value, args []js.Value) any {
	if len(args) != 2 {
		return false
	}
	current := args[0].Float()
	last := args[1].Float()
	return ShouldKeep(current, last)
}

func main() {
	c := make(chan struct{}, 0)
	js.Global().Set("shouldKeepWasm", js.FuncOf(jsShouldKeep))
	<-c
}
