import serial


def send_path(commands):
    ser = serial.Serial("COM5", 9600)
    ser.write(commands.encode())
    ser.close()
