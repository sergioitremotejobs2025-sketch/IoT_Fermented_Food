package controller

import (
	"auth-ms/model"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"testing"
)

// mockRepository is a test double that does not touch any database.
type mockRepository struct {
	existsResult bool
	existsUser   model.User
	insertResult bool
	updateRows   int64
	updatePass   bool
}

func (m *mockRepository) Exists(user model.User) (bool, model.User) {
	return m.existsResult, m.existsUser
}

func (m *mockRepository) Insert(user model.User) bool {
	return m.insertResult
}

func (m *mockRepository) Update(credentials model.Credential) int64 {
	return m.updateRows
}

func (m *mockRepository) UpdatePassword(username string, newPassword string) bool {
	return m.updatePass
}

func newTestHandlers(repo *mockRepository) *Handlers {
	return &Handlers{Repo: repo}
}

// ── Login tests ───────────────────────────────────────────────────────────────

func TestLogin_Success(t *testing.T) {
	mock := &mockRepository{
		existsResult: true,
		existsUser:   model.User{Username: "alice", Password: "Password123", RefreshToken: "old"},
		updateRows:   1,
	}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "alice", Password: "Password123", RefreshToken: "new"})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	h.Login(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 got %d", resp.StatusCode)
	}

	got, _ := ioutil.ReadAll(resp.Body)
	if string(got) != "true" {
		t.Errorf("expected body 'true', got %q", string(got))
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	mock := &mockRepository{existsResult: false}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "nobody", Password: "Password123"})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Login(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 got %d", w.Code)
	}
	if w.Body.String() != "false" {
		t.Errorf("expected 'false', got %q", w.Body.String())
	}
}

func TestLogin_UpdateFails(t *testing.T) {
	mock := &mockRepository{
		existsResult: true,
		existsUser:   model.User{Username: "alice", Password: "Password123"},
		updateRows:   0, // update returns 0 rows
	}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "alice", Password: "Password123"})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Login(w, req)

	if w.Body.String() != "false" {
		t.Errorf("expected 'false', got %q", w.Body.String())
	}
}

// ── Register tests ────────────────────────────────────────────────────────────

func TestRegister_Success(t *testing.T) {
	mock := &mockRepository{insertResult: true}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "bob", Password: "Password123", RefreshToken: "tok"})
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Register(w, req)

	if w.Body.String() != "true" {
		t.Errorf("expected 'true', got %q", w.Body.String())
	}
}

func TestRegister_DuplicateUser(t *testing.T) {
	mock := &mockRepository{insertResult: false}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "existing", Password: "Password123"})
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Register(w, req)

	if w.Body.String() != "false" {
		t.Errorf("expected 'false', got %q", w.Body.String())
	}
}

// ── Refresh tests ─────────────────────────────────────────────────────────────

func TestRefresh_Success(t *testing.T) {
	mock := &mockRepository{updateRows: 1}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.Credential{
		Username:        "alice",
		RefreshToken:    "old-token",
		NewRefreshToken: "new-token",
	})
	req := httptest.NewRequest(http.MethodPost, "/refresh", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Refresh(w, req)

	if w.Body.String() != "true" {
		t.Errorf("expected 'true', got %q", w.Body.String())
	}
}

func TestRefresh_TokenNotFound(t *testing.T) {
	mock := &mockRepository{updateRows: 0}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.Credential{Username: "alice", RefreshToken: "bad"})
	req := httptest.NewRequest(http.MethodPost, "/refresh", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Refresh(w, req)

	if w.Body.String() != "false" {
		t.Errorf("expected 'false', got %q", w.Body.String())
	}
}

func TestRefresh_EmptyBody(t *testing.T) {
	mock := &mockRepository{updateRows: 0}
	h := newTestHandlers(mock)

	req := httptest.NewRequest(http.MethodPost, "/refresh", nil)
	w := httptest.NewRecorder()

	h.Refresh(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty body, got %d", w.Code)
	}
}

// ── ChangePassword tests ──────────────────────────────────────────────────────

func TestChangePassword_Success(t *testing.T) {
	mock := &mockRepository{updatePass: true}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "alice", Password: "Password123"})
	req := httptest.NewRequest(http.MethodPut, "/change-password", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.ChangePassword(w, req)

	if w.Body.String() != "true" {
		t.Errorf("expected 'true', got %q", w.Body.String())
	}
}

func TestChangePassword_RepoFail(t *testing.T) {
	mock := &mockRepository{updatePass: false}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "alice", Password: "Password123"})
	req := httptest.NewRequest(http.MethodPut, "/change-password", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.ChangePassword(w, req)

	if w.Body.String() != "false" {
		t.Errorf("expected false on repo fail")
	}
}

func TestChangePassword_InvalidInput(t *testing.T) {
	mock := &mockRepository{updatePass: true}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "", Password: "Password123"})
	req := httptest.NewRequest(http.MethodPut, "/change-password", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.ChangePassword(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestNewHandlers(t *testing.T) {
	mock := &mockRepository{}
	h := NewHandlers(mock)
	if h.Repo != mock {
		t.Errorf("expected repo to be set")
	}
}

type errorReader struct{}

func (e *errorReader) Read(p []byte) (n int, err error) {
	return 0, fmt.Errorf("read error")
}

func TestLogin_ReadError(t *testing.T) {
	mock := &mockRepository{}
	h := newTestHandlers(mock)
	req := httptest.NewRequest(http.MethodPost, "/login", &errorReader{})
	w := httptest.NewRecorder()
	h.Login(w, req)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 on read error, got %d", w.Code)
	}
}

func TestRefresh_ReadError(t *testing.T) {
	mock := &mockRepository{}
	h := newTestHandlers(mock)
	req := httptest.NewRequest(http.MethodPost, "/refresh", &errorReader{})
	w := httptest.NewRecorder()
	h.Refresh(w, req)
	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 on read error, got %d", w.Code)
	}
}

// ── Robustness tests (TDD Phase 1: Red) ──────────────────────────────────────

func TestLogin_InvalidJSON(t *testing.T) {
	mock := &mockRepository{}
	h := newTestHandlers(mock)

	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer([]byte(`{"username": "alice", "password":`))) // Malformed JSON
	w := httptest.NewRecorder()

	h.Login(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for malformed JSON, got %d", w.Code)
	}
}

func TestRegister_InvalidJSON(t *testing.T) {
	mock := &mockRepository{}
	h := newTestHandlers(mock)

	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer([]byte(`{invalid}`)))
	w := httptest.NewRecorder()

	h.Register(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for malformed JSON, got %d", w.Code)
	}
}

func TestLogin_EmptyFields(t *testing.T) {
	mock := &mockRepository{}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "", Password: ""})
	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Login(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty fields, got %d", w.Code)
	}
}

func TestRegister_EmptyFields(t *testing.T) {
	mock := &mockRepository{}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "alice", Password: ""})
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Register(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty fields, got %d", w.Code)
	}
}

func TestRegister_WeakPassword(t *testing.T) {
	mock := &mockRepository{}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "alice", Password: "weak"}) // too short, no upper, no digit
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Register(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for weak password, got %d", w.Code)
	}
}

func TestChangePassword_WeakPassword(t *testing.T) {
	mock := &mockRepository{}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "alice", Password: "weak"})
	req := httptest.NewRequest(http.MethodPut, "/change-password", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.ChangePassword(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for weak password, got %d", w.Code)
	}
}

func TestRegister_Weak7CharPassword(t *testing.T) {
	mock := &mockRepository{}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "alice", Password: "Passwo1"}) // exactly 7 characters
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Register(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for 7 character password, got %d", w.Code)
	}
}

func TestRegister_Strong8CharPassword(t *testing.T) {
	mock := &mockRepository{insertResult: true}
	h := newTestHandlers(mock)

	body, _ := json.Marshal(model.User{Username: "alice", Password: "Passwor1"}) // exactly 8 characters
	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(body))
	w := httptest.NewRecorder()

	h.Register(w, req)

	if w.Code == http.StatusBadRequest {
		t.Errorf("expected 200 for exactly 8 character password, got %d", w.Code)
	}
}
