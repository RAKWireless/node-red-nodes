node-red-contrib-ads7830
==================================

A node-red node providing access to a ADS7830 I2C analog to digital converter.

**Tips**: Please make sure that user of system has the permissions to access i2c device, or  you cannot get  the result you want when use ads7830 node,  the result  will be `empty`.

---

## Install

Please install `node-red-contrib-ads7830` node with the following commands. If you use docker of Node-RED, you may need to replace `~/.node-red` with `/usr/src/node-red`.

```
git clone https://git.rak-internal.net/product-rd/gateway/wis-developer/rak7391/node-red-nodes.git
```

```
cp -rf node-red-nodes/node-red-contrib-ads7830 ~/.node-red/node_modules
```

```
cd ~/.node-red/node_modules/node-red-contrib-ads7830 && npm install
```

**Tips:**  After `node-red-contrib-ads7830` being installed,  **node-red should be restarted**, otherwise, the node cannot be found on the page.

## Usage

To get a voltage or difference of voltage from a ADS7830  analog to digital converter just select the correct setting for your device and trigger the node.

<img src="assets/image-20220309092410807.png" alt="image-20220309092410807" style="zoom:80%;" />

- **Name**

  Define the msg name if you wish to change the name displayed on the node.

- **/dev/i2c-?**

  Default I2C Bus is 1.  `1` is for `'/dev/i2c-1'`.

- **i2c_Address**

  The Address by default is set to `0x4A`. You can setup the ADS7830 with one of four addresses, 0x48, 0x49, 0x4a, 0x4b. Please see ads7830 documentation for more information.

- **Inputs**

  Inputs may be used for Single-ended measurements (like A0-GND) or Differential measurements (like A0-A1). Single-ended measurements measure voltages relative to a shared reference point which is almost always the main units ground. Differential measurements are “floating”, meaning that it has no reference to ground. The measurement is taken as the voltage difference between the two wires. Example: The voltage of a battery can be taken by connecting A0 to one terminal and A1 to the othe with Common-ground.

- **Internal Reference**

  Open or close internal Reference in chip.

- **A/D Converter**

  Open or close A/D Converter in chip.



## Example

[rak16001-read](examples/rak16001-read/README.md) - Extend RAK16001 in RAK7391 board and test it with NodeRed. 



## License

This project is licensed under MIT license.
