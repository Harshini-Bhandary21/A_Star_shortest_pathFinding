import serial
import time

PORT = "COM8"
BAUD = 9600

# =====================================
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


# =====================================
# SEND COMMAND
# =====================================

def send(cmd, seconds):

    print(f"\n🚀 Sending: {cmd}")

    bt.write(cmd.encode())

    time.sleep(seconds)

    bt.write(b'S')

    print("🛑 Stop")

    time.sleep(1)


# =====================================
# TEST MENU
# =====================================

while True:

    print("\n============================")
    print("1 → Forward Test")
    print("2 → Backward Test")
    print("3 → Left Turn Test")
    print("4 → Right Turn Test")
    print("5 → Long Straight Test")
    print("6 → Exit")
    print("============================")

    choice = input("Enter choice: ")

    # =================================
    # FORWARD
    # =================================

    if choice == '1':

        input("\nPlace robot straight and press ENTER")

        send('F', 2)

        print("\n👉 OBSERVE:")
        print("• Did robot move straight?")
        print("• Did it drift LEFT or RIGHT?")
        print("• How many cells did it move?")

    # =================================
    # BACKWARD
    # =================================

    elif choice == '2':

        input("\nPlace robot straight and press ENTER")

        send('B', 2)

        print("\n👉 OBSERVE:")
        print("• Did robot move straight backward?")
        print("• Drift direction?")

    # =================================
    # LEFT TURN
    # =================================

    elif choice == '3':

        input("\nPlace robot straight and press ENTER")

        send('L', 1)

        print("\n👉 OBSERVE:")
        print("• How many degrees turned?")
        print("• 45° ?")
        print("• 90° ?")
        print("• More?")

    # =================================
    # RIGHT TURN
    # =================================

    elif choice == '4':

        input("\nPlace robot straight and press ENTER")

        send('R', 1)

        print("\n👉 OBSERVE:")
        print("• How many degrees turned?")
        print("• 45° ?")
        print("• 90° ?")
        print("• More?")

    # =================================
    # LONG STRAIGHT
    # =================================

    elif choice == '5':

        input("\nPlace robot on long straight line and press ENTER")

        print("\n🚀 Long Straight Test")

        bt.write(b'F')

        time.sleep(5)

        bt.write(b'S')

        print("\n👉 OBSERVE:")
        print("• Did robot drift LEFT?")
        print("• Did robot drift RIGHT?")
        print("• Was path straight?")

    # =================================
    # EXIT
    # =================================

    elif choice == '6':

        print("\n👋 Exiting")

        bt.close()

        break

    else:

        print("❌ Invalid choice")