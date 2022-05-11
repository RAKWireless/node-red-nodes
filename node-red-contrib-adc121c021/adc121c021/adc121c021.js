/* adc121c021 ADC Library
const __copyright__ = "Copyright 2022, RAKwireless"
const __license__ = "MIT"
const __version__ = "0.0.1"
const __status__ = "Production"
*/

'use strict';
const i2c = require('i2c-bus');


// Address Pointer Register
//const i2cAddress = 0x1;
const i2cAddress = 0x51;
const VOLTAGE_REF = 5.0;

const REG_CONVERSION_RESULT = 0x00;
const REG_ALERT_STATUS = 0x01;
const REG_CONFIGURATION = 0x02;
const REG_LOW_LIMIT = 0x03;
const REG_HIGH_LIMIT = 0x04;
const REG_HYSTERESIS = 0x05;
const REG_LOWEST_CONVERSION = 0x06;
const REG_HIGEST_CONVERSION = 0x07;

// Configuration Register
const REG_CONFIG_ALERT_HOLD_MASK = 0x10;
const REG_CONFIG_ALERT_HOLD_CLEAR = 0xef;
const REG_CONFIG_ALERT_FLAG_NOCLEAR = 0x10;

const REG_CONFIG_ALERT_FLAG_MASK = 0x08;
const REG_CONFIG_ALERT_FLAG_DIS = 0xf7;
const REG_CONFIG_ALERT_FLAG_EN = 0x08;

const REG_CONFIG_ALERT_PIN_MASK = 0x04;
const REG_CONFIG_ALERT_PIN_DIS = 0xfb;
const REG_CONFIG_ALERT_PIN_EN = 0x04;

const REG_CONFIG_POLARITY_MASK = 0x01;
const REG_CONFIG_POLARITY_LOW = 0xfe;
const REG_CONFIG_POLARITY_HIGH = 0x01;

const CONFIG_CYCLE_TIME_MASK = 0xE0;
const AUTOMATIC_MODE_DISABLED = 0x00;
const CYCLE_TIME_32 = 0x20;
const CYCLE_TIME_64 = 0x40;
const CYCLE_TIME_128 = 0x60;
const CYCLE_TIME_256 = 0x80;
const CYCLE_TIME_512 = 0xA0;
const CYCLE_TIME_1024 = 0xC0;
const CYCLE_TIME_2048 = 0xE0;

module.exports = class adc121c021 {
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

        // constructor(bus = i2cAddress, addr = i2cAddress) {
        //     self.wire = bus = new smbus.SMBus(bus);
        //     this.i2cAddress = addr;

    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    read_configure_register() {
        let self = this;
        return self.wire.readByteSync(this.i2cAddress, REG_CONFIGURATION);
    }

    config_automatic_conversion_mode(cycle_time) {
        let self = this;
        var tmp = this.read_configure_register() & 0x1f;
        tmp = tmp | cycle_time;
        self.wire.writeByteSync(this.i2cAddress, REG_CONFIGURATION, tmp);
    }

    read_alert_status() {
        let self = this;
        let data, status;
        data = Buffer.alloc(2);
        self.wire.readI2cBlockSync(this.i2cAddress, REG_CONVERSION_RESULT, 2, data);
        if (data[0] & 0x80) {
            status = self.wire.readByteSync(this.i2cAddress, REG_ALERT_STATUS);
            return status;
        }
    }

    clear_aler_staus() {
        let self = this;
        self.wire.writeByteSync(this.i2cAddress, REG_ALERT_STATUS, 0);
    }

    config_alert_hold(enable) {
        let self = this;
        var tmp = this.read_configure_register();
        if (enable) {
            tmp = tmp | REG_CONFIG_ALERT_FLAG_NOCLEAR;
        } else {
            tmp = tmp | REG_CONFIG_ALERT_HOLD_CLEAR;
        }
    }

    read_alert_hold() {
        let self = this;
        var tmp = this.read_configure_register() & REG_CONFIG_ALERT_HOLD_MASK;
        return tmp;
    }

    config_alert_flag(enable) {
        let self = this;
        var tmp = this.read_configure_register();

        if (enable) {
            tmp = tmp | REG_CONFIG_ALERT_FLAG_EN;
        } else {
            tmp = tmp | REG_CONFIG_ALERT_FLAG_DIS;
        }

        self.wire.writeByteSync(this.i2cAddress, REG_CONFIGURATION, tmp);
    }

    read_alert_flag() {
        let self = this;
        return this.read_configure_register() & REG_CONFIG_ALERT_FLAG_MASK;
    }

    config_alert_pin(enable) {
        let self = this;
        var tmp = this.read_configure_register();

        if (enable) {
            tmp = tmp | REG_CONFIG_ALERT_PIN_EN;
        } else {
            tmp = tmp | REG_CONFIG_ALERT_PIN_DIS;
        }

        self.wire.writeByteSync(this.i2cAddress, REG_CONFIGURATION, tmp);
    }

    read_alert_pin() {
        let self = this;
        return this.read_configure_register() & REG_CONFIG_ALERT_PIN_MASK;
    }

    config_alert_polarity(polarity) {
        let self = this;
        var tmp = this.read_configure_register();

        if (polarity) {
            tmp = tmp | REG_CONFIG_POLARITY_HIGH;
        } else {
            tmp = tmp | REG_CONFIG_POLARITY_LOW;
        }

        self.wire.writeByteSync(this.i2cAddress, REG_CONFIGURATION, tmp);
    }

    read_alert_polarity() {
        let self = this;
        return this.read_configure_register() & REG_CONFIG_POLARITY_MASK;
    }

    config_alert_low_threshold(threshold) {
        let self = this;
        var threshold = threshold & 0x0fff;
        self.wire.write_word_data(this.i2cAddress, REG_LOW_LIMIT, threshold);
    }

    read_alert_low_threshold() {
        let self = this;
        var tmp = self.wire.read_word_data(this.i2cAddress, REG_LOW_LIMIT);
        tmp = tmp & 0x0fff;
        return tmp;
    }

    config_alert_high_threshold(threshold) {
        let self = this;
        var threshold = threshold & 0x0fff;
        self.wire.write_word_data(this.i2cAddress, REG_HIGH_LIMIT, threshold);
    }

    read_alert_high_threshold() {
        let self = this;
        var tmp;
        tmp = self.wire.read_word_data(this.i2cAddress, REG_HIGH_LIMIT);
        tmp = tmp & 0x0fff;
        return tmp;
    }

    config_hysteresis(hysteresis) {
        let self = this;
        var hysteresis = hysteresis & 0x0fff;
        self.wire.write_word_data(this.i2cAddress, REG_HYSTERESIS, hysteresis);
    }

    read_hysteresis() {
        let self = this;
        var tmp;
        tmp = self.wire.read_word_data(this.i2cAddress, REG_HYSTERESIS);
        tmp = tmp & 0x0fff;
        return tmp;
    }

    read_lowest_conversion() {
        let self = this;
        var tmp;
        tmp = self.wire.read_word_data(this.i2cAddress, REG_LOWEST_CONVERSION);
        tmp = tmp & 0x0fff;
        return tmp;
    }

    clear_lowest_conversion() {
        let self = this;
        self.wire.write_word_data(this.i2cAddress, REG_LOWEST_CONVERSION, 0x0fff);
    }

    read_highest_conversion() {
        let self = this;
        var tmp;
        tmp = self.wire.read_word_data(this.i2cAddress, REG_HIGEST_CONVERSION);
        tmp = tmp & 0x0fff;
        return tmp;
    }

    clear_highest_conversion() {
        let self = this;
        self.wire.write_word_data(this.i2cAddress, REG_HIGEST_CONVERSION, 0x0fff);
    }

    read_adc_value() {
        let self = this;
        let data = Buffer.alloc(2);
        self.wire.readI2cBlockSync(this.i2cAddress, REG_CONVERSION_RESULT, 2, data);
        var raw_adc = (data[0] & 0x0F) * 256 + data[1];
        return raw_adc;
    }

    read_adc_voltage() {
        let self = this;
        var raw_adc, voltage;
        raw_adc = this.read_adc_value();
        voltage = raw_adc * VOLTAGE_REF / 4095.0;
        return voltage;
    }

}

