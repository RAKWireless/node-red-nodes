// Description: This module will let you communicate with a PN532 RFID/NFC shield or breakout with i2c.
// License: MIT
// Author: rakwireless.com
// Version: 0.0.1

const i2c = require('i2c-bus');
const PN532 = require('./pn532');

const _I2C_ADDRESS = 0x24;

module.exports = class PN532_I2C extends PN532 {
    constructor(i2c_bus, i2cAddress, req, irq, reset, debug) {
        if (!debug) {
            debug = false;
        }
        if (!req) {
            req = false;
        }
        if (!irq) {
            irq = -1;
        }
        if (!reset) {
            reset = -1;
        }
        super(debug, req, irq, reset);

        // let self = this;
        if (typeof (i2c_bus) == 'undefined') {
            i2c_bus = 1;
        }
        if (!i2cAddress) {
            i2cAddress = _I2C_ADDRESS;
        }
        this._address = i2cAddress;

        try {
            this._wire = i2c.openSync(i2c_bus);
        } catch (e) {
            throw new Error('i2c_bus i2c-%d not exist!', i2c_bus);
        }

        this._req = req;
        this.debug = debug;

        // this.reset()
        // _ = this.firmware_version();
    }

    _wakeup() {
        // Send any special commands/data to wake up PN532
        let self = this;
        // if (self._reset_pin) {
        //     self._reset_pin.value = true;
        //     self.delay_ms(10);
        // }
        // if (self._req){
        //     self._req.direction = Direction.OUTPUT;
        //     self._req.value = false;
        //     self.delay_ms(10);
        //     self._req.value = false;
        //     self.delay_ms(10);
        // }
        self.low_power = false;
        self.SAM_configuration();  // Put the PN532 back in normal mode
    }

    _wait_ready(timeout) {
        let self = this;
        if (isNaN(timeout)) {
            timeout = 1;
        }
        // Poll PN532 if status byte is ready, up to `timeout` seconds"""
        let status = Buffer.alloc(1)
        let timestamp = new Date().getTime();
        // while ((new Date().getTime() - timestamp) < timeout*1000) {
        while ((new Date().getTime() - timestamp) < timeout * 2000) {
            try {
                self._wire.i2cReadSync(self._address, 1, status);
            }
            catch (e) {
                continue;
            }
            if (status[0] == 0x01) {
                return true;  // No longer busy
            }
            self.delay_ms(10);  // lets ask again soon!
        }
        // Timed out!
        return false;
    }

    _read_data(count) {
        let self = this;
        // Read a specified count of bytes from the PN532.
        // Build a read request frame.
        let frame = Buffer.alloc(count + 1);
        self._wire.i2cReadSync(self._address, 1, frame);  // read status byte!
        if (frame[0] != 0x01)  // not ready
            throw new Error('busy !');

        self._wire.i2cReadSync(self._address, count + 1, frame);  // ok get the data, plus statusbyte

        // if (self.debug) {
        //     console.log("Reading: ", [hex(i) for i in frame[1:]])
        // }

        return frame.slice(1);  // don't return the status byte
    }

    _write_data(framebytes) {
        // Write a specified count of bytes to the PN532
        let self = this;
        self._wire.i2cWriteSync(self._address, framebytes.length, framebytes);
    }
}
