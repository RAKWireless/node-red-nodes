# A Node-Red node for the MCP23017 & PCF8574 chips  
  
- About Node-Red [link...](https://nodered.org/)  
- [Link for the MCP chip itself](https://www.microchip.com/wwwproducts/en/MCP23017)  
- [Chip specs. PDF](https://ww1.microchip.com/downloads/en/DeviceDoc/20001952C.pdf)  
- [Link for the PCF chip itself](https://www.ti.com/product/PCF8574)  
- [Chip specs. PDF](https://www.ti.com/lit/gpn/pcf8574)  
- [Node-RED node](https://flows.nodered.org/node/mcp23017-pcf8574-aio)  
- [Github source](https://github.com/PizzaProgram/mcp23017-pcf8574-aio)  
- [Forum discussion](https://discourse.nodered.org/t/new-mcp23017-pcf8574-all-in-one-node)
  
# Code Language:  
  
- [Node.js](https://nodejs.org)  
- [JavaScript](https://en.wikipedia.org/wiki/JavaScript)  
- [HTML](https://en.wikipedia.org/wiki/HTML)  
  
# About  
  
It uses the config node "mcp_pcf_chip" for all reading and writing on i2c bus  
[More about I2C...](https://en.wikipedia.org/wiki/I%C2%B2C)  
  
- Each pin (8 or 16 in total) can be individually selected to be an input or output  
- You can place as many Nodes to your flows as many pins you use, or  
- you can also set 1-1 node only pro 0-7 or 8-15 and control via `msg.pin` and `msg.state` if `msg.payload=-1`  
- 4 states are showed of a node: `On=green`   `Off=grey`   `Uninitialised=yellow`   `Error=red`  
  
Requires 'i2c-bus' module. [link...](https://github.com/fivdi/i2c-bus)  
( _It gets automatically installed, except if you want to use it directly from function nodes._ )  
  
<img src="Node-Red-Nodes-MCP-PCF-AiO-example1.jpg" width="100%" height="100%">

# Inputs  
  
**WARNING:** input interrupts part of this component is experimental.  
 - it reads inputs non-stop, can be set milisec value (a bit higher CPU usage)  
 - it might starts multiple timers that interfere with each other? (Needs investigation.)  
 - to minimize state-refresh problem there is secondary "de-bounce" timer  
  
# Config  
  
- Each node has a global Main-Chip, that can be configured with "I2C bus number" + "Chip Address".
(The PCF8574(A) chips are showed currently with an Address multiplied by 2. Like: 0x21 * 2 = 0x42 )  
  
- Interval: is used to determine how frequently all inputs are polled. ( _Reads all 8+8 ports from bank A+B._ )  
 ! Should be minimum 20ms, because a read process of 16 pins takes 12-14ms on a Raspberry Pi 4.  
  
- Bit: is a number from 0 to 15 reflecting the pin (0-7 at FCP8574 chips)
 If "All0" or "All1" is recieved, the bit becames: -1 in logs.  
  
- Pull Up: engages the low power pull up resistor. More: https://en.wikipedia.org/wiki/Pull-up_resistor  
 (Inputs only.)  
  
- Debounce: is a timer where the state must remain at the new level for the specified time (millisec)  
 (Inputs only.)  
 ( _It will filter out too short changes, like sparkles._ )  
  
- Invert is a software-override for both Input + Output pins. It will show and act the opposite way of On/Off.  
 `0>>1 , 1>>0`  
 ( _For example some relay boards are "closing = pulling" if they get GND instead of 5V on their pins,  
 so they need to be negated with resistors. In those cases the chip must get 0x00 to "turn on"._ )  

- Start All Outputs High: when node-red is started and first chip gets inicialized, it will send a 0xFFFF signal to all pins, so they

# Known problems:

1. After disconnected of cable or USB-I2C adapter the readouts can not properly restore unless restarting the whole flow.
2. Multiple Main-chip-setup-nodes can be set to same Address, causing conflicts. (No pre-error or pre-warning happens.)
3. -- fixed 2022-03-26
4. It changes the On-Off state visually of the Node while it's not that node changed when using direct-msg-control  
5. Sending "All0" or "All1" to an MCP node turns on only 0-7 pins, if Bit of Nodes are only set to 0-7. 
  Solution: Set Bit of the node at setup to 8-15 to turn ALL!


# To Do

1. Don't even allow already selected bits to be selected again (not just error reporting about)
2. When a node is deleted or disabled - remove from ids (array in chip) --- half done at 2022-03-19 version
3. Block RW operations happening at the same time... (rework everything to Async / await and atomic flags)
4. Analize further how interrupts are dealt with in C code and write it in s/mcp23017)
5. Don't allow to create multiple main chips with the same address (MCP + PCF can be on the same address accidentally)


# Credit
Thanks to Mike Wilson for the original v0.1 node: [MCP23017chip](https://flows.nodered.org/node/node-red-contrib-mcp23017chip)


# Change Log 2022-03-26 (Y-M-D)  Version: 2.3.5.20220326
by László Szakmári (www.pizzaprogram.hu)

 - PCF chips show now correct Address -at Main-Chip setup. Fixed.

 - Fixed "interval too short" auto-increase happaning if "interrupt-triggered" read occures

 + Added examples 


# Change Log 2022-03-25 (Y-M-D)  Version: 2.3.3.20220325
by László Szakmári (www.pizzaprogram.hu)

 - Changed `msg.pin` and `msg.state` to lower case.


# Change Log 2022-03-22 (Y-M-D)  Version: 2.3.2.20220322
by László Szakmári (www.pizzaprogram.hu)

- you can set 1-1 node only pro 0-7 or 8-15 and control via `msg.Pin=` and `msg.State=` if `msg.Payload=-1`  

- fixed `consol.warning` bug if Timer set = 0ms.  


# Change Log 2022-03-21 (Y-M-D)  Version: 2.3.1.20220321
by László Szakmári (www.pizzaprogram.hu)

- Fixed bug: on input change payload was always "true". 


# Change Log 2022-03-19 (Y-M-D)  Version: 2.3.0.20220319
by László Szakmári (www.pizzaprogram.hu)

- FIRST OFFICIAL RELEASE

- Enhanced html help of the node

- fixed bugs (like: partial Deploy did not clear prev. instances from context)


# Change Log 2022-03-03 (Y-M-D)  Version: 2.3.0.20220303
by László Szakmári (www.pizzaprogram.hu)

- Added PCF8574 + PCF8574A chip support. Both In + Out. 

- Fixed Naming of PFC... to PCF... (the original code was spelled wrong).

- Detailed Logging to consol can be turned on/off with `const log2consol = False;`  and `timerLog = false;`

- Fixed Input Bugs. Now stable.

- Fixed bug if same chip had both in+out pins mixed.

- Fixed crashing of Node-red if chip or I2C bus was suddenly removed from system.

- Inject (Interrupt) trigger adds extra values to msg. [] ... see help

- New Github upload. (PFC false-named one got deleted)


# Change Log 2021-01-11 (Y-M-D) 
by László Szakmári (www.pizzaprogram.hu)

- **!!! IMPORTANT CHANGE:**
 -- [ x ] Inverse is now affecting Output too ! 
 (Some relay boards are functioning "the opposite way", turning ON if pin is Low.)

- Changed Bus open/close behaviour. Separate open before/after each read/write operation block. 
  (This way no more non-stop opened bus > no more NodeRed crash if unexpected disconnect.)

- Fixed other NR crashes: Added Error handling (try - catch) for each i2c bus operation.
  Each operation has it's own value to report proper error text. _(Like: "Bus opening failed", ... etc)_
  (But execution time increased from 8ms to 12ms on Raspberri 4)

- Fixed 16pin array initialization (16x null)

- Added multiple/same pin initialization error handling. (Highlander: "There Can Be Only One" :-D )

- Added lots of comments and constants to JS file (like IOCON, IODIR_A, etc...)

- Changed icon to a chip-like one. (font-awesome/fa-ticket)

- Faster initialisation: if set to output >> skips pullup & invert writes. 

- Prevents the input-timer to run if the previous function is still running.

- +2 states of a node and color change of Off: On=green   Off=grey   Uninitialised=yellow   Error=red

- Does not starting input-timer, if there are no input nodes available. 

- Auto-increasing read-interval if < 15ms or if reading took too long.

- If error occured during read-timer >> changing interval to 5 sec >> if normal again >> changing back

- Dokument + Code changes:
-- Pretty print of JS code (inline)
-- All local variables start now with _underline
-- Many comments + constants + references added to code
-- Fixed help in mcp_pcf_chip.html file

# Change Log 2021-09-12 (Y-M-D) 
- Fixed input

- Add input trigger to handle interrupts. If msg.payload = True >> and succesfully read 
  >> msg.immediateReadSuccess = true. If any error:Result = false

- Limit debounce timeing to max = interval - 20ms

- debounce is not starting if =0

# Change Log 2021-11-11 (Y-M-D) 
- Node name changed from MCP23017chip to current ,mcp_pfc_aio v2.1.0 
 ( _AIO = All in One  IO = Input Output_ )

