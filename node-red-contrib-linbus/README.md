# @rakwireless/linbus

A node-red-contrib-linbus module is able to parse and create LinBUS-compatible frames to be forwarded using a serial connection.

[![version](https://img.shields.io/npm/v/@rakwireless/linbus.svg?logo=npm)](https://www.npmjs.com/package/@rakwireless/linbus)
[![downloads](https://img.shields.io/npm/dm/@rakwireless/linbus.svg)](https://www.npmjs.com/package/@rakwireless/linbus)

## Install from Node-RED

From within NodeRED, visit the top right menu, select `Manage palette` and then the `Install` tab. Look for `@rakwireless/linbus` and install it.


## Manual installation (development)

Please follow the steps below to install the  `@rakwireless/linbus` module.

first, you need download the source code of this module from our `node-red-nodes` repository

```
git clone https://github.com/RAKWireless/node-red-nodes.git
```

copy `node-red-contrib-linbus` folder to  `node_modules` folder, `node_modules`  folder is located in the root directory of your node-red install.

```
cp -rf node-red-nodes/node-red-contrib-linbus ~/.node-red/node_modules
```

then go to the `node-red-contrib-linbus` folder  and run the installation command

```
cd ~/.node-red/node_modules/node-red-contrib-linbus && npm install
```

**Note:**  You must restart node-red service then you can find linbus nodes  on the left of editor window.

## Usage

`@rakwireless/linbus` has two nodes,  `linbus-parse` node and `linbus-builder` node.  they  need to be used in combination with a serial port node, you must install `node-red-node-serialport` module first

- ### linbus-parse

`linbus-parse` node that will receive data from a serial node and output a message upon valid linbus message reception (including frame ID, length and raw data a a byte buffer). in this node you must config `ID` and `Length` options.

<img src="assets/linbus-parse-config.png" alt="linbus-parse-config" style="zoom: 67%;" />

​		**ID:**

​			Specify the identifier of linbus frame that you want to parse. values in the range 0 to 63 can be used. 

​		**Length:**

​			Specify the data length of linbus frame that you want to parse. data length should be 2 bytes or 4 bytes or 8 bytes

- ### linbus-builder


`linbus-builder` node that will create a valid linbus frame from a frame ID and a byte buffer payload, the output will be fed to a serial node. 

In this node you must config `ID`option, which specify the identifier of linbus frame that you want to builder. values in the range 0 to 63 can be used. 

<img src="assets/linbus-builder-config.png" alt="linbus-builder-config" style="zoom:67%;" />

the payload is generated with an `inject` node, one thing to note is that the payload type must be set to `buffer` in the `inject` node and data length should be 2 bytes or 4 bytes or 8 bytes.

<img src="assets/inject.png" alt="inject" style="zoom:67%;" />



## Examples

[rak13005-linbus](https://github.com/RAKWireless/node-red-nodes/tree/master/node-red-contrib-linbus/examples/rak13005-linbus) - LinBUS communication using WisBlock LIN MODULE RAK13005 on RAK7391.



## License

This project is licensed under MIT license.
