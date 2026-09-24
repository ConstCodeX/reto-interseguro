package main

import (
	"log"
	"net/http"
	"os"

	"reto2/internal/security"
	httpapi "reto2/internal/transport/http"
	"reto2/internal/usecase"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	secret := os.Getenv("JWT_SECRET")
	if secret == "" { secret = "development-secret-change-me" }
	if os.Getenv("CORS_ORIGIN") == "" { os.Setenv("CORS_ORIGIN", "*") }
	devAuthEnabled := os.Getenv("ENABLE_DEV_AUTH") != "false"
	handler := security.JWT(secret, httpapi.NewHandler(usecase.NearestDepot{}, secret, devAuthEnabled))
	handler = cors(handler)
	log.Printf("nearest-depot API escuchando en :%s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil { log.Fatal(err) }
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		response.Header().Set("Access-Control-Allow-Origin", os.Getenv("CORS_ORIGIN"))
		response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Dev-Auth")
		response.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		if request.Method == http.MethodOptions { response.WriteHeader(http.StatusNoContent); return }
		next.ServeHTTP(response, request)
	})
}