node-red-contrib-shtc3
==================================

A node-red node providing access to a shtc3 temperature and humidity sensor.

**Tips**: Please make sure that user has the permissions to access  i2c devices. 

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

**Tips:**  After `node-red-contrib-shtc3` being installed,  **node-red should be restarted**, otherwise, the node cannot be found on the page.

## Usage

- **shtc3_i2c**

​		To get value of  temperature and humidity you just need to select the correct settings for your device and trigger the node.

​		<img src="assets/image-20220321162437053.png" alt="image-20220321162437053" style="zoom:80%;" />	

​		**Name**

​			Define the msg name if you wish to change the name displayed on the node.

​		**/dev/i2c-?**

​			Default I2C Bus is 1.  `1` is for `/dev/i2c-1`.

​		**i2c_Address**

​			The Address for shtc3 is `0x70` which can not be changed. 

​		**Temperature Unit**

​			You can select `Celsius` or `Fahrenheit` as you like.



The output of the node is a payload contains `temperature` and `humidity` data.

```
{
	temperature: "34.72 °C"
	humidity: "17.92 %"
}
```



## Example

- [shtc3-read](examples/shtc3-read/README.md) -  Read temperature and humidity data from shtc3 sensor.



## License

This project is licensed under MIT license.
