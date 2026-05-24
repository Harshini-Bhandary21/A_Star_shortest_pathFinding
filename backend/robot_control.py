import serial
import time

PORT = "COM8"
BAUD = 9600


# ======================================
# SEND COMMANDS
# ======================================

def send_commands(commands):

    bt = None

    try:

        print("🔄 Connecting Bluetooth...")

        bt = serial.Serial(PORT, BAUD)

        # allow HC-05 stabilization
        time.sleep(2)

        print("✅ Bluetooth Connected")

        print("🚀 Executing Commands:", commands)

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

                time.sleep(0.20)

                bt.write(b'S')

                time.sleep(0.80)

            # =================================
            # RIGHT TURN
            # =================================

            elif cmd == 'R':

                bt.write(b'R')

                time.sleep(0.06)

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

        print("✅ Robot Finished")

    except Exception as e:

        print("❌ Bluetooth Error:", e)

    finally:

        if bt is not None and bt.is_open:

            bt.close()

            print("🔌 Bluetooth Closed")