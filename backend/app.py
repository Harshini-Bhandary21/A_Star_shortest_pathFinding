from flask import Flask, request, jsonify
from flask_cors import CORS

from vision import *
from a_star import a_star
from robot import *

app = Flask(__name__)
CORS(app)

maze = None
last_path = []


@app.route("/detect")
def detect():
    global maze

    frame = get_frame()
    contour = find_maze(frame)
    corners = get_corners(contour)

    if corners is not None:
        frame = warp(frame, corners)

    processed = preprocess(frame)
    maze = detect_edges(processed)

    return jsonify({"status": "maze detected"})


@app.route("/solve", methods=["POST"])
def solve():
    global last_path

    data = request.json
    start = tuple(data["start"])
    end = tuple(data["end"])

    path = a_star(maze, start, end)
    last_path = path

    return jsonify({"path": path})


@app.route("/start")
def start():
    cmds = path_to_commands(last_path)
    send_to_robot(cmds)

    return jsonify({"status": "robot moving"})


if __name__ == "__main__":
    app.run(debug=True)
