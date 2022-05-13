/* opt3001 Library
const __copyright__ = "Copyright 2022, RAKwireless"
const __license__ = "MIT"
const __version__ = "0.0.1"
const __status__ = "Production"
*/

'use strict';
const i2c = require('i2c-bus');



//const i2cAddress = 0x1;
const i2cAddress = 0x44;
// possible i2c address: 0x44, 0x45, 0x46, 0x47
// Address Pointer Register
const I2C_LS_REG_RESULT = 0x00;
const I2C_LS_REG_CONFIG = 0x01;
const I2C_LS_REG_LOWLIMIT = 0x02;
const I2C_LS_REG_HIGHLIMIT = 0x03;
const I2C_LS_REG_MANUFACTURERID = 0x7E;
const I2C_LS_REG_DEVICEID = 0x7F;


// Configuration Register Fields Set-up
// Bit 15..12 Automatic Full-Scale Setting Mode
// 1100b = automatic full-scale setting mode, 1101b, 1110b, and 1111b are reserved for future use
var RANGE_NUMBER_FIELD = "1100";
// Bit 11 Conversion time field
// 0b = 100 ms, 1b = 800ms
var CONVERSION_TIME_FIELD = "1";
// Bit 10..9 Mode of conversion: Shutdown
// 00b = shutdown(default), 01b = single-shot; 10b,11b=continouse conversions
var MODE_OF_CONVERSION_OPERATION_FIELD = "10";
// Bit 8 Overflow flag field
var OVERFLOW_FLAG_FIELD = "0";
// Bit 7 Conversion ready field
var CONVERSION_READY_FIELD = "0";
// Bit 6 Flag high field
var FLAG_HIGH_FIELD = "0";
// Bit 5 Flag low filed
var FLAG_LOW_FIELD = "0";
// Bit 4 Latch field
// 0b = functions in transparent hysteresis-style comparison operation
// 1b =  functions in latched window-style comparison operation
var LATCH_FIELD = "1";
// Bit 3 Polarity field
// 0b =  The INT pin reports active low, pulling the pin low upon an interrupt event
// 1b = = Operation of the INT pin is inverted
var POLARITY_FIELD = "0";
// Bit 2 Mask exponent field
var MASK_EXPONENT_FIELD = "0";
// Bit 1 & 0 Fault count field
var FAULT_COUNT_FIELD = "00";





// Configdata for Register "Configuration"
const I2C_LS_CONFIG_DEFAULT_SIMPLE = 0xc810;//Reset Configuration Register

// Configdata for Register "Configuration"
const I2C_LS_CONFIG_CONT_FULL_800MS_SIMPLE = 0xcc10;
// Bit 15..12 Automatic Full-Scale Setting Mode
// Bit 11 Conversion timefield: 800ms
// 10..9 Mode of conversion: Continuous conversions
// Bit 4 Latch field

module.exports = class OPT3001 {
//class OPT3001 {
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
    /*-----------------------------------------------
    Name: init
     Description:  initiate the opt3001
     Input:  address - i2c address of the opt3001
             device - default 1
     Ausgang: opt3001
    */
  }

  read_register_16bit(adr) {
    /*-----------------------------------------------
    Name: read_register_16bit
     Description: reads a register of the opt3001
     Input:  adr - register adress to read from
     Ausgang: data
    */
    let self = this;
    var data, values;
    values = Buffer.alloc(2);
    self.wire.readI2cBlockSync(this.i2cAddress, adr, 2, values);
    data = values[0] << 8 | values[1];
    return data;
  }

  write_register_16bit(adr, data) {
    /*-----------------------------------------------
    Name: write_register_16bit
     Description:  write to a register of the opt3001
     Input: adr - register adress to write to
            data - data to write to register
     Ausgang: void
    */
    let self = this;
    var d0, d1;
    d1 = data >> 8;
    d0 = data & 0xFF;
    var buffer_data = Buffer.from([d1, d0]);
    return self.wire.writeI2cBlockSync(this.i2cAddress, adr, 2, buffer_data);
  }

  write_config_reg(data) {
    /*-----------------------------------------------
    Name: write_config_req
     Description:  write to config register
     Input:  data - data to write to register
     Ausgang: void
    */
    return this.write_register_16bit(I2C_LS_REG_CONFIG, data);
  }

  set_RANGE_NUMBER_FIELD (data){
    return RANGE_NUMBER_FIELD = String(data);
  }

  set_CONVERSION_TIME_FIELD (data){
    return CONVERSION_TIME_FIELD = String(data);
  }

  set_MODE_OF_CONVERSION_OPERATION_FIELD (data){
    return MODE_OF_CONVERSION_OPERATION_FIELD = String(data);
  }

  get_config_setup(){
    let config = RANGE_NUMBER_FIELD + CONVERSION_TIME_FIELD + MODE_OF_CONVERSION_OPERATION_FIELD + OVERFLOW_FLAG_FIELD + CONVERSION_READY_FIELD +FLAG_HIGH_FIELD+FLAG_LOW_FIELD+LATCH_FIELD+POLARITY_FIELD+MASK_EXPONENT_FIELD+FAULT_COUNT_FIELD;
    var converted_config = Number("0b"+ config)
    return converted_config;
  }

  write_config_reg(data) {
    /*-----------------------------------------------
    Name: write_config_req
     Description:  write to config register
     Input:  data - data to write to register
     Ausgang: void
    */
    return this.write_register_16bit(I2C_LS_REG_CONFIG, data);
  }

  read_manufacture_id() {
    /*-----------------------------------------------
    Name: read_manufacture_id
     Description:  read manufacture id of the opt3001
     Input: void
     Ausgang: manufacture id
    */
    return this.read_register_16bit(I2C_LS_REG_MANUFACTURERID);
  }

  read_device_id() {
    /*-----------------------------------------------
    Name: read_device_id
     Description:  read device id of the opt3001
     Input: void
     Ausgang: manufacture id
    */

    return this.read_register_16bit(I2C_LS_REG_DEVICEID);
  }

  read_lux_fixpoint() {
    /*-----------------------------------------------
    Name: read_lux_fixpoint
     Description:  read the brightness of the opt3001 with two fixed decimal places
     Input:  void
     Ausgang: manufacture id
    */
    var exponent, mantisse, req_value;
    req_value = this.read_register_16bit(I2C_LS_REG_RESULT);
    mantisse = req_value & 0xfff;
    exponent = (req_value & 0xf000) >> 12;
    // mantisse << exponent
    return Math.pow(2, exponent) * mantisse;
  }

  read_lux_float() {
    /*-----------------------------------------------
    Name: read_lux_float
     Description:  read the brightness of the opt3001 as float
     Input:  void
     Ausgang: manufacture id
    */
    var exponent, mantisse, req_value;
    req_value = this.read_register_16bit(I2C_LS_REG_RESULT);
    mantisse = req_value & 0xfff;
    exponent = (req_value & 0xf000) >> 12;
    // mantisse << exponent * 0.01
    return Math.pow(2, exponent) * mantisse * 0.01;
  }

}
