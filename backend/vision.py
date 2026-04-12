import cv2
import numpy as np

ROWS, COLS = 4, 6


def get_frame():
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    return frame


def find_maze(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 50, 150)

    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    largest = max(contours, key=cv2.contourArea)
    return largest


def get_corners(contour):
    epsilon = 0.02 * cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, epsilon, True)
    if len(approx) == 4:
        return approx.reshape(4, 2)
    return None


def warp(frame, corners):
    corners = sorted(corners, key=lambda x: (x[1], x[0]))
    top = sorted(corners[:2], key=lambda x: x[0])
    bottom = sorted(corners[2:], key=lambda x: x[0])

    tl, tr = top
    bl, br = bottom

    pts1 = np.float32([tl, tr, bl, br])
    pts2 = np.float32([[0, 0], [600, 0], [0, 400], [600, 400]])

    matrix = cv2.getPerspectiveTransform(pts1, pts2)
    return cv2.warpPerspective(frame, matrix, (600, 400))


def preprocess(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blur, 140, 255, cv2.THRESH_BINARY_INV)
    return thresh


def detect_edges(img):
    h, w = img.shape
    cell_h = h // ROWS
    cell_w = w // COLS

    maze = {}

    for i in range(ROWS):
        for j in range(COLS):
            cell = img[i * cell_h : (i + 1) * cell_h, j * cell_w : (j + 1) * cell_w]

            top = cell[0:5, :]
            bottom = cell[-5:, :]
            left = cell[:, 0:5]
            right = cell[:, -5:]

            def is_wall(edge):
                return np.mean(edge) > 40

            maze[(i, j)] = {
                "up": is_wall(top),
                "down": is_wall(bottom),
                "left": is_wall(left),
                "right": is_wall(right),
            }

    return maze
