# @rakwireless/ltr-390uv

A node providing access to ltr-390uv, measuring and calculating lux and uvi(ultraviolet index).  

[![version](https://img.shields.io/npm/v/@rakwireless/ltr-390uv.svg?logo=npm)](https://www.npmjs.com/package/@rakwireless/ltr-390uv)
[![downloads](https://img.shields.io/npm/dm/@rakwireless/ltr-390uv.svg)](https://www.npmjs.com/package/@rakwireless/ltr-390uv)

## Install from Node-RED

From within NodeRED, visit the top right menu, select `Manage palette` and then the `Install` tab. Look for `@rakwireless/ltr-390uv` and install it.


## Manual installation (development)

Please install `@rakwireless/ltr-390uv` node with the following commands. If you use docker of Node-RED, you may need to replace `~/.node-red` with `/usr/src/node-red`,

```
git clone https://github.com/RAKWireless/node-red-nodes.git
```

then copy `node-red-contrib-ltr-390uv` directory  to  the `node_modules` directory,

```
cp -rf node-red-nodes/node-red-contrib-ltr-390uv ~/.node-red/node_modules
```

lastly, change to the `node-red-contrib-ltr-390uv` directory and install the node, 

```
cd ~/.node-red/node_modules/node-red-contrib-ltr-390uv && npm install
```

**Tips:**  After the installation of `@rakwireless/ltr-390uv` is finished, please restart your Node-RED service.  Otherwise, the node cannot be found/added to the new flow.

## Usage

**NOTE**: Please make sure that user has the permissions to access i2c devices, otherwise user can not read from the ltr-390uv chip. 

To get the lux and uvi reading from the ltr-390uv,  you need to select the correct setting for `@rakwireless/ltr-390uv` node.

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



The output of the node is a payload contains the raw als data, raw uvs data,  the calculated lux and the calculated uvi.

![image-20220512120228997](assets/image-debug-node.png)


## Examples

- [rak12019-reading](https://github.com/RAKWireless/node-red-nodes/tree/master/node-red-contrib-ltr-390uv/examples/rak12019-reading) - Measure lux and uvi using WisBlock UV sensor RAK12019 from Node-RED.



## License

This project is licensed under MIT license.
