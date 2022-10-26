node-red-contrib-pn532-i2c
==================================

A node-red node providing access to PN532 module via an i2c connection, reading or writing the specified block data for a NFC/RFID card.

[![version](https://img.shields.io/npm/v/@rakwireless/pn532-i2c.svg?logo=npm)](https://www.npmjs.com/package/@rakwireless/pn532-i2c)
[![downloads](https://img.shields.io/npm/dm/@rakwireless/pn532-i2c.svg)](https://www.npmjs.com/package/@rakwireless/pn532-i2c)

## Install from Node-RED
 
From within NodeRED, visit the top right menu, select `Manage palette` and then the `Install` tab. Look for `@rakwireless/pn532-i2c` and install it.## Install

## Manual installation (development)
 
Please install `@rakwireless/pn532-i2c` node with the following commands. If you use docker of Node-RED, you may need to replace `~/.node-red` with `/usr/src/node-red`.

```
git clone https://github.com/RAKWireless/node-red-nodes.git
cp -rf node-red-nodes/node-red-contrib-pn532-i2c ~/.node-red/node_modules
cd ~/.node-red/node_modules/node-red-contrib-pn532-i2c
npm install
```

**Tips:**  After `@rakwireless/pn532-i2c` being installed,  **Node-RED should be restarted**, otherwise, the node cannot be found on the page.

## Usage

### Configure the bus

There is a `pn532_i2c-read` node and a `pn532_i2c_write` node, to read or write a NFC/RFID card from PN532 module you need to select the correct settings for the `pn532_i2c_config` node.

<img src="assets/configuration-node.png" alt="configuration-node" style="zoom:67%;" />

- **I2C Bus Number**

  Default I2C bus number for pn532 is 1.  

- **I2C Address**

  Default I2C address for pn532 is 0x24. 

### Read a specified block data

To read a specific block data from a NFC/RFID card, you just need to set the `Block Number` option in the `pn532_i2c_read` node, then you can use a `inject` node to trigger it.

<img src="assets/read-node.png" alt="read-node" style="zoom:67%;" />


### Write a specified block data

To write a specific block data to a NFC/RFID card,  you need to set the `Block Number`  in the `pn532_i2c_write` node,  you also need to set the block data in the `inject` node. data must be a buffer of 16 bytes.

<img src="assets/write-data-node.png" alt="write-data-node" style="zoom:67%;" />


## Examples

* [rak13600-nfc-read](https://github.com/RAKWireless/node-red-nodes/tree/master/node-red-contrib-pn532-i2c/examples/rak13600-nfc-read) - Read NFC tag information by rak13600.
* [rak13600-nfc-example](https://github.com/RAKWireless/node-red-nodes/tree/master/node-red-contrib-pn532-i2c/examples/rak13600-nfc/README.md) - Read or write a NFC/RFID card by rak13600.


## License

This project is licensed under MIT license.
