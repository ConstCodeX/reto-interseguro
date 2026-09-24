package usecase

import (
	"container/heap"
	"math"

	"reto2/internal/domain"
)

type NearestDepot struct{}

type queueItem struct {
	node     string
	distance int
	index    int
}

type priorityQueue []*queueItem

func (queue priorityQueue) Len() int { return len(queue) }
func (queue priorityQueue) Less(left, right int) bool { return queue[left].distance < queue[right].distance }
func (queue priorityQueue) Swap(left, right int) { queue[left], queue[right] = queue[right], queue[left]; queue[left].index = left; queue[right].index = right }
func (queue *priorityQueue) Push(item any) { *queue = append(*queue, item.(*queueItem)) }
func (queue *priorityQueue) Pop() any { old := *queue; item := old[len(old)-1]; *queue = old[:len(old)-1]; return item }

func (NearestDepot) Execute(request domain.RouteRequest) (domain.RouteResponse, error) {
	if request.AccidentLocation == "" || len(request.Depots) == 0 {
		return domain.RouteResponse{}, domain.ErrInvalidRequest
	}

	var best domain.RouteResponse
	best.Distance = math.MaxInt
	for _, depot := range request.Depots {
		distance, path, reachable := shortestPath(request.Graph, depot, request.AccidentLocation)
		if reachable && distance < best.Distance {
			best = domain.RouteResponse{FromDepot: depot, To: request.AccidentLocation, Path: path, Distance: distance}
		}
	}
	if best.Distance == math.MaxInt {
		return domain.RouteResponse{}, domain.ErrNoRoute
	}
	return best, nil
}

func shortestPath(graph domain.Graph, start, target string) (int, []string, bool) {
	distances := map[string]int{start: 0}
	previous := make(map[string]string)
	queue := &priorityQueue{{node: start, distance: 0}}
	heap.Init(queue)

	for queue.Len() > 0 {
		current := heap.Pop(queue).(*queueItem)
		if current.distance != distances[current.node] {
			continue
		}
		if current.node == target {
			return current.distance, buildPath(previous, start, target), true
		}
		for neighbor, weight := range graph[current.node] {
			if weight < 0 {
				continue
			}
			candidate := current.distance + weight
			known, exists := distances[neighbor]
			if !exists || candidate < known {
				distances[neighbor] = candidate
				previous[neighbor] = current.node
				heap.Push(queue, &queueItem{node: neighbor, distance: candidate})
			}
		}
	}
	return 0, nil, false
}

func buildPath(previous map[string]string, start, target string) []string {
	path := []string{target}
	for path[0] != start {
		path = append([]string{previous[path[0]]}, path...)
	}
	return path
}