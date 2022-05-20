const LPS2X_WHO_AM_I     = 0x0F

const LPS22_CHIP_ID      = 0xB1
const LPS22_CTRL_REG1    = 0x10
const LPS22_CTRL_REG2    = 0x11
const LPS22_STATUS       = 0x27
const LPS22_TEMP_OUT_L   = 0x2B
const LPS22_PRESS_OUT_XL = 0x28
const LPS22_PRESS_OUT_L  = 0x29

const LPS25_CHIP_ID      = 0xBD
const LPS25_CTRL_REG1    = 0x20
const LPS25_CTRL_REG2    = 0x21
const LPS25_STATUS       = 0x27
const LPS25_TEMP_OUT_L   = 0x2B
const LPS25_PRESS_OUT_XL = 0x28
const LPS25_PRESS_OUT_L  = 0x29

const LPS22 = 0
const LPS25 = 1

'use strict';
const i2cBus = require('i2c-bus');

module.exports = class LPS2X {
    constructor(i2c_bus, chip, i2cAddress) {
        let self = this;
		if(!chip) {
			chip = LPS22
		}
		
		if(chip == LPS25) {
			self._temp_scaling = 480
			self._temp_offset = 42.5
			self.LPS2X_CHIP_ID = LPS25_CHIP_ID   
			self.LPS2X_CTRL_REG1 = LPS25_CTRL_REG1   
			self.LPS2X_CTRL_REG2 = LPS25_CTRL_REG2
			self.LPS2X_STATUS = LPS25_STATUS  
			self.LPS2X_TEMP_OUT_L = LPS25_TEMP_OUT_L
			self.LPS2X_PRESS_OUT_XL = LPS25_PRESS_OUT_XL
			self.LPS2X_PRESS_OUT_L = LPS25_PRESS_OUT_L
		} else {
			self._temp_scaling = 100
			self._temp_offset = 0
			self.LPS2X_CHIP_ID = LPS22_CHIP_ID   
			self.LPS2X_CTRL_REG1 = LPS22_CTRL_REG1   
			self.LPS2X_CTRL_REG2 = LPS22_CTRL_REG2
			self.LPS2X_STATUS = LPS22_STATUS  
			self.LPS2X_TEMP_OUT_L = LPS22_TEMP_OUT_L
			self.LPS2X_PRESS_OUT_XL = LPS22_PRESS_OUT_XL
			self.LPS2X_PRESS_OUT_L = LPS22_PRESS_OUT_L	
		}
		
        if(!i2c_bus) {
            i2c_bus = 1
        }
        try {
            self._wire = i2cBus.openSync(i2c_bus);
        } catch(e) {
            throw new Error('i2c_bus i2c-%d not exist!', i2c_bus);
        }
        if(!i2cAddress) {
            i2cAddress = 0x5D
        }
        self._address = i2cAddress
		
		self.LPS2X_CHIP_ID

        self.tb = Buffer.alloc(1)
        self.rb = Buffer.alloc(1)
		
		self._wire.readI2cBlockSync(self._address, LPS2X_WHO_AM_I, 1, self.rb)
		if (self.rb[0] != self.LPS2X_CHIP_ID) {
			throw new Error("Failed to find LPS2X! Found chip ID", self.rb[0]);
		}
		
        self.oneshot = false
        self.val = [0, 0]
        // ODR=1 EN_LPFP=1 BDU=1
        self.setreg(self.LPS2X_CTRL_REG1, 0x1A)
        self.oneshot_mode(false)		
    }

    oneshot_mode(oneshot) {
        let self = this
        if (!oneshot) {
            return self.oneshot
        } else {
            self.getreg(self.LPS2X_CTRL_REG1)
            self.oneshot = oneshot
            if (oneshot) self.rb[0] &= 0x0F
            else self.rb[0] |= 0x10
            self.setreg(self.LPS2X_CTRL_REG1, self.rb[0])
        }
    }

    int16(d) {
        if (d < 0x8000) 
            return d
        else 
            return d - 0x10000
    }

    setreg(reg, dat) {
        let self = this
        self.tb[0] = dat
        self._wire.writeI2cBlockSync(self._address, reg, 1, self.tb)
    }

    getreg(reg) {
        let self = this
        self._wire.readI2cBlockSync(self._address, reg, 1, self.rb)

        return self.rb[0]
    }

    get2reg(reg) {
        let self = this
        return self.getreg(reg) + self.getreg(reg+1) * 256
    }

    ONE_SHOT(b) {
        let self = this
        if (self.oneshot) {
            self.setreg(self.LPS2X_CTRL_REG2, self.getreg(self.LPS2X_CTRL_REG2) | 0x01)
            self.getreg(0x28 + b*2)
            while (true) {
                if (self.getreg(self.LPS2X_STATUS) & b)
                    return
            }
        }
    }

    temperature() {
        let self = this
        self.ONE_SHOT(2)
        try {
            return self.int16(self.get2reg(self.LPS2X_TEMP_OUT_L)) / self._temp_scaling 
				+ self._temp_offset
        } catch(e) {
            return self.temperature_irq()
        }
    }

    pressure() {
        let self = this
        self.ONE_SHOT(1)
        try {
            return (self.getreg(self.LPS2X_PRESS_OUT_XL) + self.get2reg(self.LPS2X_PRESS_OUT_L) * 256)/4096
        } catch(e) {
            return self.pressure_irq()
        }
    }

    get() {
        let self = this
        try {
            self.val[0] = self.temperature()
            self.val[1] = self.pressure()
            return self.val
        } catch(e) {
            throw new Error('get failed!');
        }
    }

    altitude() {
        let self = this
        return (((1013.25 / self.pressure())**(1/5.257)) - 1.0) * (self.temperature() + 273.15) / 0.0065
    }
    
    temperature_irq() {
        let self = this
        self.ONE_SHOT(2)
        return self.int16(self.get2reg(self.LPS2X_TEMP_OUT_L)) / self._temp_scaling + self._temp_offset
    }

    pressure_irq() {
        let self = this
        self.ONE_SHOT(1)
        return self.get2reg(self.LPS2X_PRESS_OUT_L) >> 4
    }

    get_irq() {
        let self = this
        self.val[0] = self.temperature_irq()
        self.val[1] = self.pressure_irq()
        return self.val
    }
}

