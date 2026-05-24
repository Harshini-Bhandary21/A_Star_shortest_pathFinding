from flask import Flask, jsonify, request
from flask_cors import CORS
from vision import get_maze_grid
from robot_control import send_commands   # 🔥 FIXED IMPORT

app = Flask(__name__)
CORS(app)


# ===============================
# 🔹 CONVERT PATH → COMMANDS
# ===============================
def path_to_commands(path):

    # 🔥 1 forward = 1 cell
    CELL_MOVES = 1

    directions = []

    # ==================================
    # PATH → DIRECTIONS
    # ==================================

    for i in range(len(path) - 1):

        x1, y1 = path[i]
        x2, y2 = path[i + 1]

        # RIGHT
        if x2 == x1 and y2 == y1 + 1:
            directions.append("RIGHT")

        # LEFT
        elif x2 == x1 and y2 == y1 - 1:
            directions.append("LEFT")

        # DOWN
        elif x2 == x1 + 1 and y2 == y1:
            directions.append("DOWN")

        # UP
        elif x2 == x1 - 1 and y2 == y1:
            directions.append("UP")

    print("DIRECTIONS:", directions)

    if len(directions) == 0:
        return []

    # ==================================
    # ROBOT ALREADY FACES FIRST MOVE
    # ==================================

    facing = directions[0]

    commands = []

    # FIRST MOVE
    commands.extend(["F"] * CELL_MOVES)

    # ==================================
    # REMAINING MOVES
    # ==================================

    for move in directions[1:]:

        # SAME DIRECTION
        if move == facing:

            commands.extend(["F"] * CELL_MOVES)

        # ==================================
        # RIGHT TURN
        # ==================================

        elif (

            (facing == "UP" and move == "RIGHT") or
            (facing == "RIGHT" and move == "DOWN") or
            (facing == "DOWN" and move == "LEFT") or
            (facing == "LEFT" and move == "UP")

        ):

            # 🔥 TWO RIGHTS = 90°
            commands.extend(["R", "R"])

            commands.extend(["F"] * CELL_MOVES)

        # ==================================
        # LEFT TURN
        # ==================================

        elif (

            (facing == "UP" and move == "LEFT") or
            (facing == "LEFT" and move == "DOWN") or
            (facing == "DOWN" and move == "RIGHT") or
            (facing == "RIGHT" and move == "UP")

        ):

            # 🔥 TWO LEFTS = 90°
            commands.extend(["L", "L"])

            commands.extend(["F"] * CELL_MOVES)

        # ==================================
        # U TURN
        # ==================================

        else:

            commands.extend(["R", "R", "R", "R"])

            commands.extend(["F"] * CELL_MOVES)

        # UPDATE DIRECTION
        facing = move

    print("FINAL COMMANDS:", commands)

    return commands


# ===============================
# 🔹 A* ALGORITHM
# ===============================
def astar(grid, start, end):

    if not grid or not grid[0]:
        return []

    rows = len(grid)
    cols = len(grid[0])

    open_list = [start]
    came_from = {}

    g = {start: 0}
    f = {start: abs(start[0]-end[0]) + abs(start[1]-end[1])}

    while open_list:

        current = min(open_list, key=lambda x: f.get(x, float('inf')))

        if current == end:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]

        open_list.remove(current)

        x, y = current
        neighbors = [(x+1,y), (x-1,y), (x,y+1), (x,y-1)]

        for nx, ny in neighbors:

            if 0 <= nx < rows and 0 <= ny < cols:
                if grid[nx][ny] == 1:
                    continue

                temp_g = g[current] + 1

                if (nx, ny) not in g or temp_g < g[(nx, ny)]:
                    came_from[(nx, ny)] = current
                    g[(nx, ny)] = temp_g
                    f[(nx, ny)] = temp_g + abs(nx-end[0]) + abs(ny-end[1])

                    if (nx, ny) not in open_list:
                        open_list.append((nx, ny))

    return []


# ===============================
# 🔹 ROUTES
# ===============================

# 🔹 Detect Maze
@app.route("/detect", methods=["GET"])
def detect():
    try:
        grid = get_maze_grid()

        if not grid or len(grid) == 0:
            return jsonify({
                "success": False,
                "grid": []
            })

        return jsonify({
            "success": True,
            "grid": grid
        })

    except Exception as e:
        print("Detect Error:", str(e))
        return jsonify({
            "success": False,
            "grid": []
        })


# 🔹 Solve Path
@app.route("/solve", methods=["POST"])
def solve():
    try:
        data = request.json

        grid = data.get("grid")
        start = tuple(data.get("start"))
        end = tuple(data.get("end"))

        path = astar(grid, start, end)

        if not path:
            return jsonify({
                "success": False,
                "path": [],
                "commands": []
            })

        # 🔥 CONVERT TO COMMANDS
        commands = path_to_commands(path)

        return jsonify({
            "success": True,
            "path": path,
            "commands": commands
        })

    except Exception as e:
        print("Solve Error:", str(e))
        return jsonify({
            "success": False,
            "path": [],
            "commands": []
        })


# 🔹 Start Robot
@app.route("/start", methods=["POST"])
def start_robot():

    try:

        data = request.json

        print("📥 Incoming:", data)

        commands = data.get("commands", [])

        if not commands:
            return jsonify({
                "success": False,
                "message": "No commands received"
            })

        print("🚀 Commands:", commands)

        send_commands(commands)

        return jsonify({
            "success": True
        })

    except Exception as e:

        print("🔥 ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        })

# ===============================
# 🔹 RUN SERVER
# ===============================
if __name__ == "__main__":
    app.run(debug=False, use_reloader=False)