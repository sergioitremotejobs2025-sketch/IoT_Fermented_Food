package controller

import (
	"auth-ms/dao"
	"auth-ms/model"

	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
)

// Handlers holds the repository dependency for all HTTP handlers.
type Handlers struct {
	Repo dao.Repository
}

// NewHandlers creates a new Handlers with the given repository.
func NewHandlers(repo dao.Repository) *Handlers {
	return &Handlers{Repo: repo}
}

// getBodyContent parses application/json body into a model.User struct.
func getBodyContent(r *http.Request) (model.User, error) {
	var user model.User
	reqBody, err := ioutil.ReadAll(r.Body)

	if err != nil {
		log.Println("Error reading request body:", err.Error())
		return user, err
	}

	err = json.Unmarshal(reqBody, &user)
	if err != nil {
		log.Println("Error unmarshaling JSON:", err.Error())
		return user, err
	}
	return user, nil
}

// Login handles POST /login.
func (h *Handlers) Login(w http.ResponseWriter, r *http.Request) {
	log.Println("POST /login")

	user, err := getBodyContent(r)
	if err != nil || user.Username == "" || user.Password == "" {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	existsUser, dbUser := h.Repo.Exists(user)
	loginCorrect := false

	if existsUser {
		var updateCredential model.Credential = model.Credential{
			Username:        user.Username,
			RefreshToken:    dbUser.RefreshToken,
			NewRefreshToken: user.RefreshToken,
		}

		rows := h.Repo.Update(updateCredential)
		loginCorrect = rows == 1
	}

	fmt.Fprintf(w, fmt.Sprintf("%t", loginCorrect))
}

// validatePassword checks if the password meets security requirements.
func validatePassword(password string) bool {
	return len(password) >= 8
}

// Register handles POST /register.
func (h *Handlers) Register(w http.ResponseWriter, r *http.Request) {
	log.Println("POST /register")

	user, err := getBodyContent(r)
	if err != nil || user.Username == "" || user.Password == "" {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if !validatePassword(user.Password) {
		http.Error(w, "Weak password", http.StatusBadRequest)
		return
	}

	success := h.Repo.Insert(user)

	fmt.Fprintf(w, fmt.Sprintf("%t", success))
}

// Refresh handles POST /refresh.
func (h *Handlers) Refresh(w http.ResponseWriter, r *http.Request) {
	log.Println("POST /refresh")

	var credentials model.Credential
	reqBody, err := ioutil.ReadAll(r.Body)

	if err != nil {
		log.Println("Error reading request body:", err.Error())
		http.Error(w, "Error reading body", http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(reqBody, &credentials)
	if err != nil || credentials.Username == "" {
		log.Println("Error unmarshaling refresh JSON or empty username")
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	rows := h.Repo.Update(credentials)
	success := rows == 1

	fmt.Fprintf(w, fmt.Sprintf("%t", success))
}

// ChangePassword handles PUT /change-password.
func (h *Handlers) ChangePassword(w http.ResponseWriter, r *http.Request) {
	log.Println("PUT /change-password")

	user, err := getBodyContent(r)
	if err != nil || user.Username == "" || user.Password == "" {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if !validatePassword(user.Password) {
		http.Error(w, "Weak password", http.StatusBadRequest)
		return
	}

	success := h.Repo.UpdatePassword(user.Username, user.Password)
	fmt.Fprintf(w, fmt.Sprintf("%t", success))
}
