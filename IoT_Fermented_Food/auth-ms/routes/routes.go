package routes

import (
	"auth-ms/controller"
	"auth-ms/dao"
	"log"

	"net/http"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// GetRouter returns a new router with the real production repository.
// Deprecated: use SetupRouter with a specific repository instead.
func GetRouter() *mux.Router {
	return SetupRouter(dao.NewMysqlRepository())
}

// SetupRouter initializes and returns a router with the given repository.
func SetupRouter(repo dao.Repository) *mux.Router {
	handlers := controller.NewHandlers(repo)

	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/login", handlers.Login).Methods("POST")
	router.HandleFunc("/register", handlers.Register).Methods("POST")
	router.HandleFunc("/refresh", handlers.Refresh).Methods("POST")
	router.HandleFunc("/change-password", handlers.ChangePassword).Methods("PUT")
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","service":"auth-ms"}`))
	}).Methods("GET")

	router.HandleFunc("/docs", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./docs/index.html")
	}).Methods("GET")

	router.HandleFunc("/docs/swagger.json", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./docs/swagger.json")
	}).Methods("GET")

	router.Handle("/metrics", promhttp.Handler()).Methods("GET")

	return router
}

// App starts the server on the specified port.
func App(port string) error {
	router := GetRouter()
	log.Println("auth-ms listening on " + port)
	return http.ListenAndServe(port, router)
}
