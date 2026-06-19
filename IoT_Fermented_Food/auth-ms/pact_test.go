package main

import (
	"auth-ms/model"
	"auth-ms/routes"
	"fmt"
	"log"
	"net"
	"net/http"
	"testing"

	"github.com/pact-foundation/pact-go/v2/models"
	"github.com/pact-foundation/pact-go/v2/provider"
)

// MockRepository is a mock for the Repository interface
type MockRepository struct {
	ExistsResult         bool
	ExistsUser           model.User
	InsertResult         bool
	UpdateResult         int64
	UpdatePasswordResult bool
}

func (m *MockRepository) Exists(user model.User) (bool, model.User) {
	return m.ExistsResult, m.ExistsUser
}
func (m *MockRepository) Insert(user model.User) bool {
	return m.InsertResult
}
func (m *MockRepository) Update(credentials model.Credential) int64 {
	return m.UpdateResult
}
func (m *MockRepository) UpdatePassword(username string, newPassword string) bool {
	return m.UpdatePasswordResult
}

func TestProvider(t *testing.T) {
	mockRepo := &MockRepository{}
	router := routes.SetupRouter(mockRepo)

	// Start the provider on a random local port
	ln, err := net.Listen("tcp", ":0")
	if err != nil {
		t.Fatal(err)
	}
	defer ln.Close()

	port := ln.Addr().(*net.TCPAddr).Port
	go func() {
		if err = http.Serve(ln, router); err != nil {
			log.Println("Server closed or error:", err)
		}
	}()

	verifier := provider.NewVerifier()

	// Map provider states to repository behavior
	stateHandlers := models.StateHandlers{
		"user exists with valid credentials": func(setup bool, state models.ProviderState) (models.ProviderStateResponse, error) {
			mockRepo.ExistsResult = true
			mockRepo.ExistsUser = model.User{Username: "testuser", Password: "hashedpassword"}
			mockRepo.UpdateResult = 1
			return nil, nil
		},
		"user exists but invalid credentials": func(setup bool, state models.ProviderState) (models.ProviderStateResponse, error) {
			mockRepo.ExistsResult = false
			return nil, nil
		},
		"user does not exist": func(setup bool, state models.ProviderState) (models.ProviderStateResponse, error) {
			mockRepo.ExistsResult = false
			mockRepo.InsertResult = true
			return nil, nil
		},
		"valid refresh tokens": func(setup bool, state models.ProviderState) (models.ProviderStateResponse, error) {
			mockRepo.UpdateResult = 1
			return nil, nil
		},
		"user exists for password change": func(setup bool, state models.ProviderState) (models.ProviderStateResponse, error) {
			mockRepo.UpdatePasswordResult = true
			return nil, nil
		},
	}

	// Verify the Pact
	err = verifier.VerifyProvider(t, provider.VerifyRequest{
		ProviderBaseURL: fmt.Sprintf("http://localhost:%d", port),
		PactFiles:       []string{"../orchestrator-ms/pacts/OrchestratorMS-AuthMS.json"},
		StateHandlers:   stateHandlers,
		Provider:        "AuthMS",
	})

	if err != nil {
		t.Fatal(err)
	}
}
