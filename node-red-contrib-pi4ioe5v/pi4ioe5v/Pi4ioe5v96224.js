/* PI4IOE5V96224 GPIO Expander Library
const __copyright__ = "Copyright 2022, RAKwireless"
const __license__ = "MIT"
const __version__ = "0.1.0"
const __status__ = "Production"
*/

'use strict';

const i2c = require('i2c-bus');

// I2C address
const I2C_ADDR = 0x20;

// IO Number
const IO_NUMBER = 24;

module.exports = class Pi4ioe5v96224 {
    constructor(device, i2cAddress) {
        if (typeof (device) == 'undefined') {
            device = 1;
        }
        if (!i2cAddress) {
            this.i2cAddress = I2C_ADDR;
        } else {
            this.i2cAddress = i2cAddress;
        }
        this.wire = i2c.openSync(device);
        this.values = [0, 0, 0];
    }

    initialize() {
        let self = this;
        self.getAllPinVals()
        
        return 0;
    }

    setOnePinVal(port, pin, value) {
        let self = this;
        self.getAllPinVals();
        if (value)
            self.values[port] |= (1 << pin);
        else
            self.values[port] &= ~(1 << pin);
        
        let buffer = Buffer.alloc(self.values.length);
        let d = new DataView(buffer.buffer);
        d.setUint8(0, self.values[0]);
        d.setUint8(1, self.values[1]);
        d.setUint8(2, self.values[2]);
        
        self.wire.i2cWriteSync(this.i2cAddress, self.values.length, buffer);
    }

    getOnePinVal(port, pin) {
        let self = this;
        self.getAllPinVals();
        return (self.values[port] >> pin) & 0x01;
    }
    
    getAllPinVals() {
        let self = this;
        let buffer = Buffer.alloc(self.values.length);
        self.wire.i2cReadSync(this.i2cAddress, self.values.length, buffer);
        let d = new DataView(buffer.buffer);
        self.values[0] = d.getUint8(0);
        self.values[1] = d.getUint8(1);
        self.values[2] = d.getUint8(2);
        
        return 0;
    }
}
