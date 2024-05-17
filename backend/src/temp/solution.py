import sys

def add_numbers(a, b):
    return int(a) + int(b)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 add_numbers.py <number1> <number2>")
        sys.exit(1)

    num1 = int(sys.argv[1])
    num2 = int(sys.argv[2])
    result = add_numbers(num1, num2)
    print(result)
