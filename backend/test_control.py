import serial
import time

PORT = "COM8"
BAUD = 9600

# ======================================
# TEST COMMANDS
# ======================================

commands = ['F', 'L', 'F', 'F', 'F', 'R', 'F']

# ======================================
# CONNECT BLUETOOTH
# =====================================

try:

    print("🔄 Connecting Bluetooth...")

    bt = serial.Serial(PORT, BAUD)

    time.sleep(2)

    print("✅ Bluetooth Connected")

except Exception as e:

    print("❌ Connection Error:", e)

    exit()


# ======================================
# EXECUTE COMMANDS
# ======================================

print("🚀 Executing:", commands)

for cmd in commands:

    print("➡️", cmd)

    # =================================
    # FORWARD
    # =================================

    if cmd == 'F':

        # move forward

        bt.write(b'F')

        time.sleep(0.73)

        bt.write(b'S')

        time.sleep(0.15)

        # =================================
        # SMALL LEFT CORRECTION
        # =================================

        bt.write(b'C')

        time.sleep(0.25)

        bt.write(b'S')

        time.sleep(0.25)

    # =================================
    # LEFT TURN
    # =================================

    elif cmd == 'L':

        bt.write(b'L')

        time.sleep(0.3)

        bt.write(b'S')

        time.sleep(0.80)

    # =================================
    # RIGHT TURN
    # =================================

    elif cmd == 'R':

        bt.write(b'R')

        time.sleep(0.10)

        bt.write(b'S')

        time.sleep(0.80)

    # =================================
    # BACKWARD
    # =================================

    elif cmd == 'B':

        bt.write(b'B')

        time.sleep(0.40)

        bt.write(b'S')

        time.sleep(0.30)

print("✅ Finished")

bt.close()

print("🔌 Bluetooth Closed")