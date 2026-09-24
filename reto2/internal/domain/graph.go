package domain

import "errors"

var ErrNoRoute = errors.New("no se encontró una ruta desde ningún depósito")
var ErrInvalidRequest = errors.New("la ubicación del accidente y los depósitos son obligatorios")

type Graph map[string]map[string]int

type RouteRequest struct {
	AccidentLocation string `json:"accidentLocation"`
	Depots           []string `json:"depots"`
	Graph            Graph `json:"graph"`
}

type RouteResponse struct {
	FromDepot string   `json:"fromDepot"`
	To        string   `json:"to"`
	Path      []string `json:"path"`
	Distance  int      `json:"distance"`
}