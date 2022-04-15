# node-red-contrib-ltr-390uv

A node providing access to ltr-390uv, measuring and calculating lux and uvi(ultraviolet index).  

**Tips**: Please make sure that user has the permissions to access i2c devices, otherwise user can not read from the ltr-390uv chip. 

---

## Install

Please install `node-red-contrib-ltr-390uv` node with the following commands. If you use docker of Node-RED, you may need to replace `~/.node-red` with `/usr/src/node-red`,

```
git clone -b dev https://git.rak-internal.net/product-rd/gateway/wis-developer/rak7391/node-red-nodes.git
```

then copy `node-red-contrib-ltr-390uv` directory  to  the `node_modules` directory,

```
cp -rf node-red-nodes/node-red-contrib-ltr-390uv ~/.node-red/node_modules
```

lastly, change to the `node-red-contrib-ltr-390uv` directory and install the node, 

```
cd ~/.node-red/node_modules/node-red-contrib-ltr-390uv && npm install
```

**Tips:**  After the installation of  `node-red-contrib-ltr-390uv`  is finished, please restart your node-red service.  Otherwise, the node cannot be found/added to the new flow.

## Usage

To get the lux and uvi reading from the ltr-390uv,  you need to select the correct setting for `node-red-contrib-ltr-390uv` node.

<img src="assets/ltr-390uv-setting.png" alt="ltr-390uv-setting" style="zoom:67%;" />

**Name**

Define the msg name if you wish to change the name displayed on the node.

**/dev/i2c-?**

The i2c bus number, the default value is `1` , it means `'/dev/i2c-1'`.

**i2c_Address**

The i2c slave address for the ltr-390uv, by default is set to `0x53`.

**gain**

Define the als/uvs measuring gain range. the default value is `1x`

**resolution**

Define the als/uvs measuring resolution, the default value is `16 Bit`


The output of the node is a payload contains the raw als data, raw uvs data,  the calculated lux and the calculated uvi

<img src="assets/debug-node.png" alt="debug-node" style="zoom:67%;" />


## Example

This example outputs the measuring result with `debug` node every 2 seconds.

Once your installed the node in Node-RED, copy the content of the following .json file and paste it to the Clipboard in Node-RED, or you can download the .json file and import it. 

```
[
    {
        "id": "f6f2187d.f17ca8",
        "type": "tab",
        "label": "rak12019-reading",
        "disabled": false,
        "info": ""
    },
    {
        "id": "c330ccc393fc83d4",
        "type": "inject",
        "z": "f6f2187d.f17ca8",
        "name": "",
        "props": [
            {
                "p": "payload"
            },
            {
                "p": "topic",
                "vt": "str"
            }
        ],
        "repeat": "2",
        "crontab": "",
        "once": false,
        "onceDelay": 0.1,
        "topic": "",
        "payload": "",
        "payloadType": "date",
        "x": 130,
        "y": 280,
        "wires": [
            [
                "1acded7d9712deeb"
            ]
        ]
    },
    {
        "id": "9e3562fd807a1f78",
        "type": "debug",
        "z": "f6f2187d.f17ca8",
        "name": "",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "false",
        "statusVal": "",
        "statusType": "auto",
        "x": 510,
        "y": 280,
        "wires": []
    },
    {
        "id": "1acded7d9712deeb",
        "type": "ltr-390uv",
        "z": "f6f2187d.f17ca8",
        "name": "",
        "i2c_device_number": 1,
        "i2c_address": "0x53",
        "gain": "1",
        "resolution": "4",
        "x": 320,
        "y": 280,
        "wires": [
            [
                "9e3562fd807a1f78"
            ]
        ]
    }
]
```

## License

This project is licensed under MIT license.
