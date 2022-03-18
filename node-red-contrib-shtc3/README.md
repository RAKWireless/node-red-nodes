node-red-contrib-shtc3
==================================

A node-red node providing access to a shtc3 temperature and humidity sensor.

---

## Install

Please install `node-red-contrib-shtc3` node with the following commands. If you use docker of Node-RED, you may need to replace `~/.node-red` with `/usr/src/node-red`.

```
git clone -b dev https://git.rak-internal.net/product-rd/gateway/wis-developer/rak7391/node-red-nodes.git
```

```
cp -rf node-red-nodes/node-red-contrib-shtc3 ~/.node-red/node_modules
```

```
cd ~/.node-red/node_modules/node-red-contrib-shtc3 && npm install
```

## Usage

To get value of  temperature and humidity you just need to select the correct setting for your device and trigger the node.

<img src="assets/image-20220318194952263.png" alt="image-20220318194952263" style="zoom:80%;" />

- **Name**

  Define the msg name if you wish to change the name displayed on the node.

- **/dev/i2c-?**

  Default I2C Bus is 1.  `1` is for `'/dev/i2c-1'`.

- **i2c_Address**

  The Address fo shtc3 is 0x70 which can not be changed. 

- **Temperature Unit**

  You can select `Centigrage` or `Fahrenheit` as you like.




## Example

TO DO



## License

This project is licensed under MIT license.
