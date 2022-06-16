# @rakwireless/adc121c021

The node-red-contrib-adc121c021 node allows users to read analog inputs from adc121c021 and then convert them to digital readings. 

[![version](https://img.shields.io/npm/v/@rakwireless/adc121c021.svg?logo=npm)](https://www.npmjs.com/package/@rakwireless/adc121c021)
[![downloads](https://img.shields.io/npm/dm/@rakwireless/adc121c021.svg)](https://www.npmjs.com/package/@rakwireless/adc121c021)

## Install from Node-RED

From within NodeRED, visit the top right menu, select `Manage palette` and then the `Install` tab. Look for `@rakwireless/adc121c021` and install it.


## Manual installation (development)

Please install `@rakwireless/adc121c021` node with the following commands. If you use docker of Node-RED, you may need to replace `~/.node-red` with `/usr/src/node-red`,

```
git clone https://github.com/RAKWireless/node-red-nodes.git
```

then copy `node-red-contrib-adc121c021` directory  to  the `node_modules` directory,

```
cp -rf node-red-nodes/node-red-contrib-adc121c021 ~/.node-red/node_modules
```

lastly, change to the `node-red-contrib-adc121c021` directory and install the node, 

```
cd ~/.node-red/node_modules/node-red-contrib-adc121c021 && npm install
```

**Tips:**  After the installation of `@rakwireless/adc121c021` is finished, please restart your Node-RED service.  Otherwise, the node cannot be found/added to the new flow.

## Usage

**NOTE**: Please make sure that user has the permissions to access GPIO and i2c devices. 

- adc121c021_i2c

​		To get the voltage reading from the adc121c021, user only need to define the i2c bus of the chip. 

<img src="assets/adc121c021_i2c node.png" alt="adc121c021_i2c node configuration"/>

​		**Name**		

​			Define the message name if you wish to change the name displayed on the node.

​		**/dev/i2c-?**

​			Default I2C Bus is `1`.  `1` is for `'/dev/i2c-1'`.

​		**i2c_Address**

​			The Address by default is set to `0x51`, this is the I2C address of RAK12004. Please check [adc121c021's datasheet](https://www.ti.com/lit/ds/symlink/adc121c021.pdf?ts=1649592829477&ref_url=https%253A%252F%252Fwww.google.com%252F) for more 		information. 

​		The output of the node is showed as follows.

```
{
	i2c_address: 81

	i2c_device_number: 1

	Raw_value: 2350

	Volts:  "2.869"
}
```



## Example

- [rak12004-reading](https://github.com/RAKWireless/node-red-nodes/tree/master/node-red-contrib-adc121c021/examples/rak12004-reading) - Read smoke PPM using WisBlock sensor [RAK12004](https://store.rakwireless.com/products/mq2-gas-sensor-module-rak12004).
- [rak12009-reading](https://github.com/RAKWireless/node-red-nodes/tree/master/node-red-contrib-adc121c021/examples/rak12009-reading) - Read Alcohol Gas  PPM Using WisBlock Sensor [RAK12009](https://store.rakwireless.com/products/wisblock-mq3-gas-sensor-rak12009).


## License

This project is licensed under MIT license.
