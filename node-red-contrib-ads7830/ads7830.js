/* ADS7830 ADC Library
const __copyright__ = "Copyright 2022, RAKwireless"
const __license__ = "MIT"
const __version__ = "0.0.1"
const __status__ = "Production"
*/

'use strict';
const i2c = require('i2c-bus');

// The address of ADS7830 can be changed making the option of connecting multiple devices
// | 1 | 0 | 0 | 1 | 0 | A1 | A0 | R/W |
// address=0x48    # 0x48, 1001 000
// address=0x49    # 0x49, 1001 001
    const i2cAddress = 0x4A    // 0x4A, 1001 010
// address=0x4B    # 0x4B, 1001 011

// The command byte determines ADS7830's operating mode,
// check https://www.ti.com/lit/ds/symlink/ads7830.pdf table 1 and table 2 for more details.
// The command byte have 3 parts: Single-Ended/Differential Inputs, Channel Selections, and Power-Down
// 
// command structure
// | SD | C2 | C1 | C0 | PD1 | PD0 | X | X |
// 1. SD: Single-Ended/Differential Inputs (Table 2)
    const SingleEnded = '0'  // Differential Inputs
    const Differential = '1'  // Single-Ended Inputs
 
// 2. C2 - C0: Channel Selections (Table 2)
// channel = '000'  # if sd == 0 Single-Ended, Channel 0; if sd == 1, else Differential, CH0+ CH1-
// channel = '001'  # if sd == 0 Single-Ended, Channel 1; if sd == 1, else Differential, CH2+ CH3-
// channel = '010'  # if sd == 0 Single-Ended, Channel 2; if sd == 1, else Differential, CH4+ CH5-
// channel = '011'  # if sd == 0 Single-Ended, Channel 3; if sd == 1, else Differential, CH6+ CH7-
// channel = '100'  # if sd == 0 Single-Ended, Channel 4; if sd == 1, else Differential, CH0- CH1+
// channel = '101'  # if sd == 0 Single-Ended, Channel 5; if sd == 1, else Differential, CH2- CH3+
// channel = '110'  # if sd == 0 Single-Ended, Channel 6; if sd == 1, else Differential, CH4- CH5+
// channel = '111'  # if sd == 0 Single-Ended, Channel 7; if sd == 1, else Differential, CH6- CH7+
    const singleEndChannel = ['000', '001', '010', '011', '100', '101', '110', '111'];
    const DifferentialChannel = {
		"0_1": '000', 
		"2_3": '001', 
		"4_5": '010', 
		"6_7": '011', 
		"1_0": '100', 
		"3_2": '101', 
		"5_4": '110', 
		"7_6": '111'
	};

// 3. PD1-0: Power-Down Selection (Table 1)
// pd = '00'  # Power Down Between A/D Converter Conversions
// pd = '01'  # Internal Reference OFF and A/D Converter ON
// pd = '10'  # Internal Reference ON and A/D Converter OFF
// pd = '11'  # Internal Reference ON and A/D Converter ON

module.exports = class ads7830 {
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
    }

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

    readSingleEnded(channel, internalReferenceOnOff, ADConverterOnOff) {
        let self = this;
        let command = parseInt(singleEndChannel[channel]
			+ internalReferenceOnOff + ADConverterOnOff + '00', 2);
        self.wire.i2cWriteSync(this.i2cAddress, 1, Buffer.from([command]));
		this.sleep(0.5);
		let data = Buffer.alloc(1);
        self.wire.i2cReadSync(this.i2cAddress, 1, data);
        return data[0];
    }

    readDifferential(channelPositive, channelNegative, internalReferenceOnOff, ADConverterOnOff) {
        let self = this;
        let command = parseInt(DifferentialChannel[channelPositive+'_'+channelNegative]
			+ internalReferenceOnOff + ADConverterOnOff + '00', 2);
        self.wire.i2cWriteSync(this.i2cAddress, 1, Buffer.from([command]));
		this.sleep(0.5);
		let data = Buffer.alloc(1);
        self.wire.i2cReadSync(this.i2cAddress, 1, data);
        return data[0];
    }
}
