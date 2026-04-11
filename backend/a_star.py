import heapq


def astar(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    open_list = []
    heapq.heappush(open_list, (0, start))

    came_from = {}
    g = {start: 0}

    def h(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    while open_list:
        _, current = heapq.heappop(open_list)

        if current == end:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            return path[::-1]

        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nx, ny = current[0] + dx, current[1] + dy

            if 0 <= nx < rows and 0 <= ny < cols:
                if grid[nx][ny] == 1:
                    continue

                new_g = g[current] + 1

                if (nx, ny) not in g or new_g < g[(nx, ny)]:
                    g[(nx, ny)] = new_g
                    f = new_g + h((nx, ny), end)
                    heapq.heappush(open_list, (f, (nx, ny)))
                    came_from[(nx, ny)] = current

    return []
