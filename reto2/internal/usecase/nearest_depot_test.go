package usecase

import (
	"testing"
	"reto2/internal/domain"
)

func TestNearestDepotReturnsShortestRoute(t *testing.T) {
	request := domain.RouteRequest{
		AccidentLocation: "San Isidro",
		Depots: []string{"Miraflores", "Ate"},
		Graph: domain.Graph{
			"Miraflores": {"San Isidro": 7, "Barranco": 3},
			"San Isidro": {"Miraflores": 7, "Lince": 4},
			"Barranco": {"Miraflores": 3, "Surco": 5},
			"Lince": {"San Isidro": 4, "Surco": 6},
			"Surco": {"Barranco": 5, "Lince": 6, "Ate": 10},
			"Ate": {"Surco": 10},
		},
	}

	response, err := (NearestDepot{}).Execute(request)
	if err != nil { t.Fatalf("unexpected error: %v", err) }
	if response.FromDepot != "Miraflores" || response.Distance != 7 { t.Fatalf("unexpected response: %+v", response) }
	if len(response.Path) != 2 || response.Path[0] != "Miraflores" || response.Path[1] != "San Isidro" { t.Fatalf("unexpected path: %v", response.Path) }
}

func TestNearestDepotReturnsControlledErrorWhenUnreachable(t *testing.T) {
	request := domain.RouteRequest{AccidentLocation: "Callao", Depots: []string{"Ate"}, Graph: domain.Graph{"Ate": {"Surco": 10}}}
	_, err := (NearestDepot{}).Execute(request)
	if err != domain.ErrNoRoute { t.Fatalf("expected ErrNoRoute, got %v", err) }
}