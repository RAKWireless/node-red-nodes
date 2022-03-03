# node-red-contrib-pi4ioe5v

node-red-contrib-pi4ioe5v node is  IO expander Node-RED node running on raspberry pi.  Its chip is  PI4IOE5V96224 which can expand 24 IO pin with i2c interface.

For most Pi this is 1 for /dev/i2c-1, or 0 for /dev/i2c-0 for a older rev 1 Pi.

## Install

Please install `node-red-contrib-pi4ioe5v` node with the following commands. If you use docker of Node-RED, you may need to replace `~/.node-red` with `/usr/src/node-red`.

```
git clone {repository address} && cp -rf node-red-contrib-pi4ioe5v ~/.node-red/node_modules
```

```
cd ~/.node-red/node_modules/node-red-contrib-pi4ioe5v && npm install
```

## Usage

Provides two nodes - one to receive IO state, and one to set IO state.

### pi4ioe5v in

PI4IOE5VXXX IO expander input node. Generates a `msg.payload` with either a 0 or 1 depending on the state of the input pin.

### pi4ioe5v out

PI4IOE5VXXX IO expander output node. Set specific IO pin as  0 or 1. 

## Example

Copy next json to a file and rename file as pi4ioe5v-toggle-led.json

Import the json file to Node-RED then deploy the flow.

```
[
    {
        "id": "3bc0f3d95be661cb",
        "type": "tab",
        "label": "pi4ioe5v-toggle-led",
        "disabled": false,
        "info": "The example shows how to toggle the on-board LED in the RAK7391. LED on RAK7391 uses IO0_7 port of PI4IOE5V96224.",
        "env": []
    },
    {
        "id": "fd16c1b19021b336",
        "type": "pi4ioe5v in",
        "z": "3bc0f3d95be661cb",
        "name": "",
        "bus": "1",
        "address": "0x20",
        "pin": "7",
        "interval": "5000",
        "x": 240,
        "y": 280,
        "wires": [
            [
                "14ba9ee6ac8352dc"
            ]
        ]
    },
    {
        "id": "f2260f68abd285f3",
        "type": "pi4ioe5v out",
        "z": "3bc0f3d95be661cb",
        "name": "",
        "bus": "1",
        "address": "0x20",
        "pin": "7",
        "x": 650,
        "y": 280,
        "wires": []
    },
    {
        "id": "14ba9ee6ac8352dc",
        "type": "function",
        "z": "3bc0f3d95be661cb",
        "name": "toggle_led",
        "func": "let val = parseInt(msg.payload);\nif(val != 0 && val != 1) {\n    log.error('wrong value');\n} else {\n    msg.payload = 1 - msg.payload;\n}\n\nreturn msg;",
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 450,
        "y": 280,
        "wires": [
            [
                "f2260f68abd285f3"
            ]
        ]
    }
]
```

The example shows how to toggle the LED which connects to IO0_7 pin of PI4IOE5V96224.

