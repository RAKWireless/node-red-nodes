node-red-contrib-lps2x
==================================

A node-red node providing access to lps22hb or lps25hb I2C barometer sensor.

---

## Install

Please install `node-red-contrib-lps2x` node with the following commands. If you use docker of Node-RED, you may need to replace `~/.node-red` with `/usr/src/node-red`.

```
git clone -b dev https://git.rak-internal.net/product-rd/gateway/wis-developer/rak7391/node-red-nodes.git
```

```
cp -rf node-red-nodes/node-red-contrib-lps2x ~/.node-red/node_modules
```

```
cd ~/.node-red/node_modules/node-red-contrib-lps2x && npm install
```

**Tips:**  After `node-red-contrib-lps2x`  installed,  **node-red should be restarted**, otherwise, the node cannot be found on the page.

## Usage

To get barometer  you just need to select the correct settings for your device and trigger the node.

<img src="assets/image-20220427101909481.png" alt="image-20220427101909481" style="zoom:50%;" />	

- **Name**

  Define the node name if you wish to change the name displayed on the node.

- **/dev/i2c-?**

  Default I2C Bus is 1.  `1` is for `/dev/i2c-1`.

- **Chip**

  You can select `LPS22HB` or `LPS25HB`.

- **i2c_Address**

  The Address for LPS2x is 0x5C or 0x5D. 



## Examples

[rak1902-read](examples/rak1902-read/README.md) - Read sensor data from RAK1902 every 5 seconds.

## License

This project is licensed under MIT license.
