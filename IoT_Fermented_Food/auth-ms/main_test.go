package main

import (
	"os"
	"testing"
)

func TestRunError(t *testing.T) {
	os.Setenv("PORT", "-1")
	err := Run()
	if err == nil {
		t.Error("expected an error")
	}
}

func TestMain(t *testing.T) {
	oldLogFatal := logFatal
	defer func() { logFatal = oldLogFatal }()
	logFatalCalled := false
	logFatal = func(v ...any) {
		logFatalCalled = true
	}

	os.Setenv("PORT", "-1")
	main()

	if !logFatalCalled {
		t.Errorf("Expected logFatal to be called when Run() errors out")
	}
}
