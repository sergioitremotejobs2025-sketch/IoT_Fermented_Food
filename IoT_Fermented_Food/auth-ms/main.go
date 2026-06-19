package main

import (
	"auth-ms/helper"
	"auth-ms/routes"

	"log"

	_ "github.com/go-sql-driver/mysql"
)

var logFatal = log.Fatal

func Run() error {
	port := ":" + helper.GetEnv("PORT", "5000")
	log.Println("Starting GO server on port " + port)
	return routes.App(port)
}

func main() {
	logFatal(Run())
}
