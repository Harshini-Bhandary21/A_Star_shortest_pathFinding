import cv2
import numpy as np
import requests

CAMERA_URL = "http://10.253.212.123:8080/shot.jpg"


def get_frame():
    try:
        resp = requests.get(CAMERA_URL, timeout=5)
        img_arr = np.array(bytearray(resp.content), dtype=np.uint8)
        return cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
    except:
        return None


# ===============================
# 🔹 GROUP LINES
# ===============================
def group_lines(arr, gap=20):

    if len(arr) == 0:
        return []

    groups = []
    curr = [arr[0]]

    for i in range(1, len(arr)):
        if arr[i] - arr[i-1] < gap:
            curr.append(arr[i])
        else:
            groups.append(int(np.mean(curr)))
            curr = [arr[i]]

    groups.append(int(np.mean(curr)))
    return groups


# ===============================
# 🔹 MAIN FUNCTION
# ===============================
def get_maze_grid():

    frame = get_frame()
    if frame is None:
        return []

    img = cv2.resize(frame, (800, 600))

    # ===============================
    # 🔥 STEP 1: THRESHOLD
    # ===============================
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 130, 255, cv2.THRESH_BINARY_INV)

    cv2.imwrite("debug_thresh.jpg", thresh)

    # ===============================
    # 🔥 STEP 2: FIND WHITE LINES
    # ===============================
    # White lines = grid separators
    vertical_sum = np.sum(thresh, axis=0)
    horizontal_sum = np.sum(thresh, axis=1)

    vertical_sum = vertical_sum / np.max(vertical_sum)
    horizontal_sum = horizontal_sum / np.max(horizontal_sum)

    # 🔥 detect strong white peaks
    v_lines = np.where(vertical_sum > 0.6)[0]
    h_lines = np.where(horizontal_sum > 0.6)[0]

    # group lines
    v_lines = group_lines(v_lines)
    h_lines = group_lines(h_lines)

    print("V lines:", v_lines)
    print("H lines:", h_lines)

    if len(v_lines) < 2 or len(h_lines) < 2:
        print("❌ Grid not detected")
        return []

    # ===============================
    # 🔥 STEP 3: BUILD GRID
    # ===============================
    rows = len(h_lines) - 1
    cols = len(v_lines) - 1

    print("Detected:", rows, "x", cols)

    grid = []

    for i in range(rows):
        row = []

        for j in range(cols):

            y1, y2 = h_lines[i], h_lines[i+1]
            x1, x2 = v_lines[j], v_lines[j+1]

            cell = thresh[y1:y2, x1:x2]

            if cell.size == 0:
                row.append(0)
                continue

            # 🔥 IMPORTANT LOGIC
            # Black = cell = path
            # White = wall

            black_ratio = np.sum(cell == 0) / cell.size

            if black_ratio > 0.5:
                row.append(0)  # path
            else:
                row.append(1)  # wall

        grid.append(row)

    print("GRID:", grid)

    return grid