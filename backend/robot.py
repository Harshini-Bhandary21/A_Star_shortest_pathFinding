import serial
import time

BT = serial.Serial("COM5", 9600)  # change if needed


def path_to_commands(path):
    cmds = []

    for i in range(len(path) - 1):
        x1, y1 = path[i]
        x2, y2 = path[i + 1]

        if x2 == x1 and y2 == y1 + 1:
            cmds.append("R")
        elif x2 == x1 and y2 == y1 - 1:
            cmds.append("L")
        elif x2 == x1 + 1:
            cmds.append("F")
        elif x2 == x1 - 1:
            cmds.append("B")

    return cmds


def send_to_robot(cmds):
    for c in cmds:
        BT.write(c.encode())
        time.sleep(1)

    BT.write(b"S")
