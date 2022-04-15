import gpiod
import sys
import time

if len(sys.argv) > 4:
    LED_CHIP = sys.argv[1]
    LED_LINE_OFFSET = int(sys.argv[2])
    LED_LINE_DIRECTION = int(sys.argv[3])
    LED_LINE_VALUE = int(sys.argv[4])
else:
    print('''Usage:
    python3 blink.py <chip> <line offset>''')
    sys.exit()

chip = gpiod.chip(LED_CHIP)
led = chip.get_line(LED_LINE_OFFSET)

config = gpiod.line_request()
if LED_LINE_DIRECTION == 1:
    config.request_type = gpiod.line_request.DIRECTION_OUTPUT
else:
    config.request_type = gpiod.line_request.DIRECTION_INPUT

led.request(config)

val = led.get_value()
if LED_LINE_DIRECTION == 1 and val != LED_LINE_VALUE:
    val = LED_LINE_VALUE
    led.set_value(val)

if LED_LINE_DIRECTION == 1:
    direction = "output"
else:
    direction = "input"

msg = {"gpiochip":int(LED_CHIP), "gpio":LED_LINE_OFFSET, "direction":direction, "value":val}

print(msg)

