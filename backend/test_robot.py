import serial
import time

# ======================================
# BLUETOOTH SETTINGS
# ======================================

PORT = "COM8"
BAUD = 9600


# ======================================
# CONNECT
# ======================================

try:

    print("🔄 Connecting Bluetooth...")

    bt = serial.Serial(PORT, BAUD)

    time.sleep(2)

    print("✅ Bluetooth Connected")

except Exception as e:

    print("❌ Connection Error:", e)

    exit()


# ======================================
# SETTINGS
# ======================================

FORWARD_TIME = 1.5
TURN_TIME = 1.0


# ======================================
# FORWARD TEST
# ======================================

def test_forward():

    print("\n🚀 FORWARD TEST")

    input("Place robot at start cell and press ENTER...")

    bt.write(b'F')

    start = time.time()

    time.sleep(FORWARD_TIME)

    bt.write(b'S')

    end = time.time()

    print("✅ Forward Complete")

    print("⏱ Time:", round(end - start, 2), "seconds")

    print("👉 Check if robot moved EXACTLY 1 cell")


# ======================================
# LEFT TEST
# ======================================

def test_left():

    print("\n⬅️ LEFT TURN TEST")

    input("Place robot facing straight and press ENTER...")

    bt.write(b'L')

    start = time.time()

    time.sleep(TURN_TIME)

    bt.write(b'S')

    end = time.time()

    print("✅ Left Turn Complete")

    print("⏱ Time:", round(end - start, 2), "seconds")

    print("👉 Check if robot turned EXACTLY 90° LEFT")


# ======================================
# RIGHT TEST
# ======================================

def test_right():

    print("\n➡️ RIGHT TURN TEST")

    input("Place robot facing straight and press ENTER...")

    bt.write(b'R')

    start = time.time()

    time.sleep(TURN_TIME)

    bt.write(b'S')

    end = time.time()

    print("✅ Right Turn Complete")

    print("⏱ Time:", round(end - start, 2), "seconds")

    print("👉 Check if robot turned EXACTLY 90° RIGHT")


# ======================================
# CONTINUOUS PATH TEST
# ======================================

def test_path():

    print("\n🤖 PATH TEST")

    input("Place robot at start and press ENTER...")

    commands = [
        'F',
        'L',
        'F',
        'F',
        'R',
        'F'
    ]

    print("🚀 Executing:", commands)

    for cmd in commands:

        print("➡️", cmd)

        bt.write(cmd.encode())

        if cmd == 'F':

            time.sleep(FORWARD_TIME)

        else:

            time.sleep(TURN_TIME)

        bt.write(b'S')

        time.sleep(0.5)

    print("✅ Path Complete")


# ======================================
# MENU
# ======================================

while True:

    print("\n==========================")
    print("1 → Test Forward")
    print("2 → Test Left")
    print("3 → Test Right")
    print("4 → Test Full Path")
    print("5 → Exit")
    print("==========================")

    choice = input("Enter choice: ")

    if choice == '1':

        test_forward()

    elif choice == '2':

        test_left()

    elif choice == '3':

        test_right()

    elif choice == '4':

        test_path()

    elif choice == '5':

        print("👋 Exiting")

        bt.close()

        break

    else:

        print("❌ Invalid choice")