package httpapi

import (
	"encoding/json"
	"errors"
	"net/http"

	"reto2/internal/domain"
	"reto2/internal/security"
	"reto2/internal/usecase"
)

type Handler struct { nearestDepot usecase.NearestDepot; jwtSecret string; devAuthEnabled bool }

func NewHandler(nearestDepot usecase.NearestDepot, jwtSecret string, devAuthEnabled bool) http.Handler {
	handler := &Handler{nearestDepot: nearestDepot, jwtSecret: jwtSecret, devAuthEnabled: devAuthEnabled}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", handler.health)
	mux.HandleFunc("GET /openapi.json", handler.openapi)
	mux.HandleFunc("POST /api/v1/auth/dev-token", handler.devToken)
	mux.HandleFunc("POST /api/v1/routes/nearest-depot", handler.nearest)
	return mux
}

func (handler *Handler) devToken(response http.ResponseWriter, request *http.Request) {
	if !handler.devAuthEnabled || request.Header.Get("X-Dev-Auth") != "true" {
		writeJSON(response, http.StatusNotFound, map[string]string{"error": "Endpoint de autenticacion de desarrollo deshabilitado"})
		return
	}
	token, err := security.SignDevelopmentToken(handler.jwtSecret)
	if err != nil { writeJSON(response, http.StatusInternalServerError, map[string]string{"error": "No se pudo generar el token"}); return }
	writeJSON(response, http.StatusOK, map[string]any{"token": token, "expiresIn": "1h", "developmentOnly": true})
}

func (handler *Handler) health(response http.ResponseWriter, _ *http.Request) {
	writeJSON(response, http.StatusOK, map[string]string{"status": "ok", "service": "nearest-depot", "version": "v1"})
}

func (handler *Handler) openapi(response http.ResponseWriter, _ *http.Request) {
	writeJSON(response, http.StatusOK, map[string]any{"openapi": "3.0.3", "info": map[string]string{"title": "Nearest Depot API", "version": "1.0.0"}, "paths": map[string]any{"/api/v1/auth/dev-token": map[string]any{"post": map[string]string{"summary": "Genera un token automatico de desarrollo"}}, "/api/v1/routes/nearest-depot": map[string]any{"post": map[string]string{"summary": "Encuentra el depósito más cercano"}}, "/health": map[string]any{"get": map[string]string{"summary": "Estado del servicio"}}}})
}

func (handler *Handler) nearest(response http.ResponseWriter, request *http.Request) {
	var input domain.RouteRequest
	if err := json.NewDecoder(request.Body).Decode(&input); err != nil {
		writeJSON(response, http.StatusBadRequest, map[string]string{"error": "JSON de entrada inválido"})
		return
	}
	result, err := handler.nearestDepot.Execute(input)
	if errors.Is(err, domain.ErrInvalidRequest) { writeJSON(response, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
	if errors.Is(err, domain.ErrNoRoute) { writeJSON(response, http.StatusNotFound, map[string]string{"error": err.Error()}); return }
	writeJSON(response, http.StatusOK, result)
}

func writeJSON(response http.ResponseWriter, status int, body any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(body)
}