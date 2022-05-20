/* ltr-uv390 Library
const __copyright__ = "Copyright 2022, RAKwireless"
const __license__ = "MIT"
const __version__ = "0.0.1"
const __status__ = "Production"
*/


'use strict';
const i2c = require('i2c-bus');

// Register List
const MAIN_CTRL = 0x00;
const ALS_UVS_MEAS_RATE = 0x04;
const ALS_UVS_GAIN = 0x05;
const PART_ID = 0x06;
const MAIN_STATUS = 0x07;
const ALS_DATA_0 = 0x0D;
const ALS_DATA_1 = 0x0E;
const ALS_DATA_2 = 0x0F;
const UVS_DATA_0 = 0x10;
const UVS_DATA_1 = 0x11;
const UVS_DATA_2 = 0x12;
const INT_CFG = 0x19;
const INT_PST = 0x1A;
const ALS_UVS_THRES_UP_0 = 0x21;
const ALS_UVS_THRES_UP_1 = 0x22;
const ALS_UVS_THRES_UP_2 = 0x23;
const ALS_UVS_THRES_DOWN_0 = 0x24;
const ALS_UVS_THRES_DOWN_1 = 0x25;
const ALS_UVS_THRES_DOWN_2 = 0x26;
//Mode
const ALS_MODE = 0;
const UVS_MODE = 1;
//Enable
const STANDBY = 0;
const ACTIVE = 1;

const gain_dict = {0:1, 1:3, 2:6, 3:9, 4:18};
const integration_time_dict = {0:4, 1:2, 2:1, 3:0.5, 4:0.25, 5:0.0315};
const resolution_dict = {0:20, 1:19, 2:18, 3:17, 4:16, 5:13};

module.exports = class LTR_390UV {

    constructor(device, i2cAddress) {     
        this.i2cAddress = i2cAddress;
        this.wire = i2c.openSync(device);

    }

    set_als_uvs_enable(enable) {
        var ctrl;
        ctrl = this.wire.readByteSync(this.i2cAddress, MAIN_CTRL);
        if(enable == STANDBY) {
            ctrl &= 0xFD;
        }

        if(enable == ACTIVE) {
            ctrl |= 0x02;
        }
        this.wire.writeByteSync(this.i2cAddress, MAIN_CTRL, ctrl);
    }
    
    set_als_uvs_mode(mode) {
        var ctrl;
        ctrl = this.wire.readByteSync(this.i2cAddress, MAIN_CTRL);
        if(mode == ALS_MODE) {
            ctrl = 0x02
        }

        if(mode == UVS_MODE) {
            ctrl = 0x0A;
        }
        this.wire.writeByteSync(this.i2cAddress, MAIN_CTRL, ctrl);
    }

    set_als_uvs_gain(gain) {
        this.wire.writeByteSync(this.i2cAddress, ALS_UVS_GAIN, gain);
    }

    set_als_uvs_resolution(resolution) {
        var meas_rate;
        meas_rate = this.wire.readByteSync(this.i2cAddress, ALS_UVS_MEAS_RATE);
	    meas_rate &= 0x0F;
	    meas_rate |= resolution << 4;
        this.wire.writeByteSync(this.i2cAddress, ALS_UVS_MEAS_RATE, meas_rate);
    }

    read_als_data() {
        var data0 = this.wire.readByteSync(this.i2cAddress, ALS_DATA_0);
        var data1 = this.wire.readByteSync(this.i2cAddress, ALS_DATA_1);
        var data2 = this.wire.readByteSync(this.i2cAddress, ALS_DATA_2);
        return data0 + data1*256 + data2*65536;    
    }

    calculate_lux(als, gain, resolution, window_factor=1) {
        var ALS_DATA = als;
        var GAIN = gain_dict[gain];
        var INT = integration_time_dict[resolution];
        var Wfac = window_factor
        var lux = (0.6*ALS_DATA)/(GAIN*INT)*Wfac;
        return lux;
    }

    read_uvs_data() {
        var data0 = this.wire.readByteSync(this.i2cAddress, UVS_DATA_0);
        var data1 = this.wire.readByteSync(this.i2cAddress, UVS_DATA_1);
        var data2 = this.wire.readByteSync(this.i2cAddress, UVS_DATA_2);
        return data0 + data1*256 + data2*65536;    
    }

    calculate_uvi(uvs, gain, resolution, window_factor=1) {
        var UVS_DATA = uvs;
        var UVS_SENSITIVITY = gain_dict[gain]/18*(2 << resolution_dict[resolution])/(2 << 20)*2300;
        var Wfac = window_factor;
        var uvi = UVS_DATA/UVS_SENSITIVITY*Wfac;
        return uvi;
    }
}

