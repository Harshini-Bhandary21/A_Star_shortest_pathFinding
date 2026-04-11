from flask import Flask, jsonify
from flask_cors import CORS
from a_star import astar
from vision import get_grid

app = Flask(_name_)
CORS(app)


@app.route("/solve")
def solve():
    grid = get_grid()

    start = (0, 0)
    end = (3, 5)

    path = astar(grid, start, end)

    return jsonify({"grid": grid, "path": path})


if _name_ == "_main_":
    app.run(debug=True)
