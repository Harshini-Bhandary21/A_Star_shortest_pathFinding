import heapq


def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def get_neighbors(node, maze):
    i, j = node
    dirs = maze[node]
    neighbors = []

    if not dirs["up"] and i > 0:
        neighbors.append((i - 1, j))
    if not dirs["down"] and i < 3:
        neighbors.append((i + 1, j))
    if not dirs["left"] and j > 0:
        neighbors.append((i, j - 1))
    if not dirs["right"] and j < 5:
        neighbors.append((i, j + 1))

    return neighbors


def a_star(maze, start, end):
    open_set = [(0, start)]
    came_from = {}
    g_score = {start: 0}

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == end:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]

        for neighbor in get_neighbors(current, maze):
            temp = g_score[current] + 1

            if neighbor not in g_score or temp < g_score[neighbor]:
                g_score[neighbor] = temp
                f = temp + heuristic(neighbor, end)
                heapq.heappush(open_set, (f, neighbor))
                came_from[neighbor] = current

    return []
