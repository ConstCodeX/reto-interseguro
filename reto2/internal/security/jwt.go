package security

import (
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func SignDevelopmentToken(secret string) (string, error) {
	return jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"scope": "routes:nearest-depot",
		"exp":   time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte(secret))
}

func JWT(secret string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		if request.Method == http.MethodOptions || request.URL.Path == "/health" || request.URL.Path == "/openapi.json" || (request.URL.Path == "/api/v1/auth/dev-token" && request.Method == http.MethodPost && request.Header.Get("X-Dev-Auth") == "true") { next.ServeHTTP(response, request); return }
		parts := strings.SplitN(request.Header.Get("Authorization"), " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" || !valid(parts[1], secret) {
			response.Header().Set("Content-Type", "application/json")
			response.WriteHeader(http.StatusUnauthorized)
			_, _ = response.Write([]byte(`{"error":"Token JWT requerido o inválido"}`))
			return
		}
		next.ServeHTTP(response, request)
	})
}

func valid(token, secret string) bool {
	parsed, err := jwt.Parse(token, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok { return nil, jwt.ErrSignatureInvalid }
		return []byte(secret), nil
	})
	return err == nil && parsed.Valid
}