//==============================================================================
// File      :  shtc3.js
// Brief     :  A driver for the SHTC3 temperature and humidity sensor.
// Author    :  rakwireless.com
// Date      :  2022-03-18
//==============================================================================
'use strict';
const i2c = require('i2c-bus');

//------------------------------------------------------------------------------
const _SHTC3_DEFAULT_ADDR = 0x70;  // SHTC3 I2C Address
const _SHTC3_CHIP_ID      = 0x807; // CHIP ID

const _SHTC3_NORMAL_MEAS_TFIRST_STRETCH = 0x7CA2; // Normal measurement, temp first with Clock Stretch Enabled
const _SHTC3_LOWPOW_MEAS_TFIRST_STRETCH = 0x6458; // Low power measurement, temp first with Clock Stretch Enabled
const _SHTC3_NORMAL_MEAS_HFIRST_STRETCH = 0x5C24; // Normal measurement, hum first with Clock Stretch Enabled
const _SHTC3_LOWPOW_MEAS_HFIRST_STRETCH = 0x44DE; // Low power measurement, hum first with Clock Stretch Enabled
const _SHTC3_NORMAL_MEAS_TFIRST         = 0x7866; // Normal measurement, temp first with Clock Stretch disabled
const _SHTC3_LOWPOW_MEAS_TFIRST         = 0x609C; // Low power measurement, temp first with Clock Stretch disabled
const _SHTC3_NORMAL_MEAS_HFIRST         = 0x58E0; // Normal measurement, hum first with Clock Stretch disabled
const _SHTC3_LOWPOW_MEAS_HFIRST         = 0x401A; // Low power measurement, hum first with Clock Stretch disabled

const _SHTC3_READID    = 0xEFC8; // Read Out of ID Register
const _SHTC3_SOFTRESET = 0x805D; // Soft Reset
const _SHTC3_SLEEP     = 0xB098; // Enter sleep mode
const _SHTC3_WAKEUP    = 0x3517; // Wakeup mode
//------------------------------------------------------------------------------
const Fahrenheit = 1
const Centigrade = 0


module.exports = class shtc3 {
    constructor(i2c_bus, i2cAddress) {
		let self = this;
		if (typeof (i2c_bus) == 'undefined') {
		    i2c_bus = 1;
		}
		if (!i2cAddress) {
		    self._address = _SHTC3_DEFAULT_ADDR;
		} else {
		    self._address = i2cAddress;
		}
		
		try {
			self._wire = i2c.openSync(i2c_bus);
		} catch(e) {
			throw new Error('i2c_bus i2c-%d not exist!', i2c_bus);
		}

		self.mode = _SHTC3_NORMAL_MEAS_TFIRST;
		self._buffer = Buffer.alloc(6);

		self._wakeup(); // must wakeup firstly, or it won't work
        self.reset();
        self._chip_id = self._get_chip_id();
        if (self._chip_id != _SHTC3_CHIP_ID) {
            throw new Error("Failed to find an SHTC3 sensor - check your wiring!");
		}
	}

	/* helper function to write a command to the i2c device */
    _write_command(cmd) {
		let self = this;
        self._buffer[0] = cmd >> 8;
        self._buffer[1] = cmd & 0xFF;

		let count = 10;
		while (count-- > 0) {
			try {
				self._wire.i2cWriteSync(self._address, 2, self._buffer);
				break;
			} catch(e) {
				self.delay_ms(10);
			}
		}
	}

	/* Determines the chip id of the sensor */
    _get_chip_id() {  // readCommand(SHTC3_READID, data, 3);
		let self = this;
        self._write_command(_SHTC3_READID);
        self.delay_ms(1);
		try {
			self._wire.i2cReadSync(self._address, 3, self._buffer);
		} catch(e) {
			console.log(e);
		}
		
		let dv = new DataView(self._buffer.buffer);
        let chip_id = dv.getUint16(0);
		
        return ((chip_id & 0x083F) & 0x083F);
	}

	/* Perform a soft reset of the sensor, resetting all settings to their power-on defaults */
    reset() {
		let self = this;
        self._write_command(_SHTC3_SOFTRESET);
        self.delay_ms(5);
	}
		
	_sleep() {
		this._write_command(_SHTC3_SLEEP);
		this.delay_ms(5)
	}
	
	_wakeup(){
		this._write_command(_SHTC3_WAKEUP);
	}

    /*read both temperature and relative_humidity */
    get_temperature_humidity(temp_unit) {
        let self = this;
		self._wakeup();
        // send correct command for the current power state
		self._write_command(self.mode);
		self.delay_ms(15);

		try {
			self._wire.i2cReadSync(self._address, 6, self._buffer);
		} catch(e) {
			console.info(e);
		}
		
		// separate the read data
		let temperature = 0;
		let humidity = 0;
		let dv = new DataView(self._buffer.buffer);
		let raw_temp = dv.getUint16(0);
		let temp_crc = self._buffer[2];
		let raw_humidity = dv.getUint16(3);
		let humidity_crc = self._buffer[5];

		// check CRC of bytes
		if ((temp_crc == self._crc8(self._buffer, 0, 1))
		&& (humidity_crc == self._crc8(self._buffer, 3, 4))) 
		{
			// decode data into human values:
			// convert bytes into 16-bit signed integer
			// convert the LSB value to a human value according to the datasheet
			raw_temp = ((4375 * raw_temp) >> 14) - 4500;
			temperature = raw_temp / 100.0;
			if(temp_unit == Fahrenheit) {
				temperature = (1.8 * temperature + 32).toFixed(2) + ' ºF';
			} else {
				temperature = temperature.toFixed(2) + ' ºC';
			}

			// repeat above steps for humidity data
			raw_humidity = 625 * raw_humidity >> 12;
			humidity = raw_humidity / 100.0 + ' %';
		}

		self._sleep();
		return {
			"temperature": temperature,
			"humidity": humidity
		}
	}

    /* verify the crc8 checksum */
    _crc8(buffer, start_index, end_index) {
        let crc = 0xFF;
        for (let i = start_index; i <= end_index; i++) {
            crc ^= buffer[i];
            for (let i=0; i< 8; i++) {
                if (crc & 0x80) {
                    crc = (crc << 1) ^ 0x31;
				} else {
                    crc = crc << 1;
				}
			}
		}

        return crc & 0xFF;  // return the bottom 8 bits
	}
	
	delay_ms(milliseconds) {
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
		if (new Date().getTime() - start > milliseconds) {
		  break;
		}
	  }
	}
}

