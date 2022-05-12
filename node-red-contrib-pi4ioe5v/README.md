# node-red-contrib-pi4ioe5v

node-red-contrib-pi4ioe5v node is  IO expander Node-RED node running on raspberry pi.  Its chip is  PI4IOE5V96224 which can expand 24 IO pin with i2c interface.

![image-20220302171903406](assets/image-20220302171903406.png)

**Tips**: Please make sure that user of system has the permissions to access i2c device, or  you cannot get  the result you want when use  pi4ioe5v node.

## Install

Please install `node-red-contrib-pi4ioe5v` node with the following commands. If you use docker of Node-RED, you may need to replace `~/.node-red` with `/usr/src/node-red`.

```
git clone -b dev https://git.rak-internal.net/product-rd/gateway/wis-developer/rak7391/node-red-nodes.git
```

```
cp -rf node-red-nodes/node-red-contrib-pi4ioe5v ~/.node-red/node_modules
```

```
cd ~/.node-red/node_modules/node-red-contrib-pi4ioe5v && npm install
```

**Tips:**  After `node-red-contrib-pi4ioe5v` being installed,  **node-red should be restarted**, otherwise, the node cannot be found on the page.

## Usage

Provides two nodes - one to receive IO state, and one to set IO state.

### pi4ioe5v in

PI4IOE5VXXX IO expander input node. Generates a `msg.payload` with either a 0 or 1 depending on the state of the input pin.

<img src="assets/image-20220310143705111.png" alt="image-20220310143705111" style="zoom:80%;" />

- **Name**

  Define the msg name if you wish to change the name displayed on the node.

- **Bus**

  Default I2C Bus is 1.  `1` is for `'/dev/i2c-1'`.

- **Address**

  The Address by default is set to 0x20. You can setup the PI4IOE5V96224 address according to your hardware. Please see  PI4IOE5V96224 documentation for more information.

- **IO**

  Select one pin whose state you what get.



### pi4ioe5v out

PI4IOE5VXXX IO expander output node. Set specific IO pin as  0 or 1. 

<img src="assets/image-20220303171847690.png" alt="image-20220303171847690" style="zoom:80%;" />

- **Name**

  Define the msg name if you wish to change the name displayed on the node.

- **Bus**

  Default I2C Bus is 1.  `1` is for `'/dev/i2c-1'`.

- **Address**

  The Address by default is set to 0x20. You can setup the PI4IOE5V96224 address according to your hardware. Please see  PI4IOE5V96224 documentation for more information.

- **IO**

  Select one pin whose state you what set.



## Example

[pi4ioe5v-toggle-led](examples/pi4ioe5v-toggle-led/README.md) - The example shows how to toggle the LED which connects to IO0_7 pin of PI4IOE5V96224.



## License

This project is licensed under MIT license.
