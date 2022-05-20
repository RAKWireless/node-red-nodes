/* RAK1903 WisBlock Ambient Light Sensor/opt3001 node
const __copyright__ = "Copyright 2022, RAKwireless"
const __license__ = "MIT"
const __version__ = "0.0.1"
const __status__ = "Production"
*/
// Licensed under the MIT License
// rakwireless.com

module.exports = function (RED) {
    let opt3001 = require('./opt3001');
    function opt3001MainFunction(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // config
        this.i2c_device_number = parseInt(config.i2c_device_number, 10);
        this.i2c_address = parseInt(config.i2c_address);
        this.rangeNumber = parseInt(config.rangeNumber);
        this.conversionTime = parseInt(config.conversionTime);
        this.conversionMode = parseInt(config.conversionMode);

        //clear status icon if one is hanging about when you deploy the node
        status_clear({});

        //Function to Clear user notices, used for timmer
        function status_clear() {
            //clear status icon
            node.status({});
        };

        function sleep(delay) 
	    {
        	let endTime = new Date().getTime()+parseInt(delay);
        	while (new Date().getTime() < endTime );
	    }

        //setup the light sensor
        var light;
        try {
            light = new opt3001(this.i2c_device_number, this.i2c_address);
            light.set_RANGE_NUMBER_FIELD(this.rangeNumber); //scale settings
            light.set_CONVERSION_TIME_FIELD(this.conversionTime);
            light.set_MODE_OF_CONVERSION_OPERATION_FIELD (this.conversionMode);
        }
        catch (error) {
            this.warn("Load const light: " + error);
            this.status({
                fill: 'red',
                shape: 'dot',
                text: "detected error"
            });
        }

        //DO STUFF WHEN TRIGGERED
        this.on("input", function (msg) {
            //clear status icon every new trigger input
            node.status({});
            // create object to store voltage values
            var read_lux_float_object = {};
            // voltage_output_object = {};
            var sensor_config = light.get_config_setup()
            sleep(50);
            light.write_config_reg(sensor_config)
            sleep(50);

            try {
                var lux_float_result = light.read_lux_float();
                read_lux_float_object['Ambient light (lux)'] = lux_float_result.toFixed(3);
                read_lux_float_object['i2c_address'] = "0x"+(this.i2c_address).toString(16);
                read_lux_float_object['i2c_device_number'] = this.i2c_device_number;
                read_lux_float_object['Range number field'] = this.rangeNumber;
                read_lux_float_object['Conversion time field'] = this.conversionTime;
                read_lux_float_object['Mode of conversion operation field'] = this.conversionMode;
            }
            catch (error) { console.error(error); }
            msg.payload = read_lux_float_object;
            node.send(msg);
        });

        this.on('close', function () {
            node.status({ fill: "grey", shape: "ring", text: "opt3001.status.closed" });
            node.cb.cancel();
            opt3001.close();
            if (done) { done(); }
        });
    }
    RED.nodes.registerType("opt3001", opt3001MainFunction);
};
