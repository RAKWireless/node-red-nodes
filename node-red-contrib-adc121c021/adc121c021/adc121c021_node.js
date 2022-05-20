/* adc121c021 ADC node
const __copyright__ = "Copyright 2022, RAKwireless"
const __license__ = "MIT"
const __version__ = "0.0.1"
const __status__ = "Production"
*/
// Licensed under the MIT License
// rakwireless.com

module.exports = function (RED) {
    let adc121c021 = require('./adc121c021');
    function adc121c021MainFunction(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // config
        this.i2c_device_number = parseInt(config.i2c_device_number, 10);
        this.i2c_address = parseInt(config.i2c_address);

        //clear status icon if one is hanging about when you deploy the node
        status_clear({});

        //Function to Clear user notices, used for timmer
        function status_clear() {
            //clear status icon
            node.status({});
        };

        //setup the adc                                      
        var adc;
        try {
            adc = new adc121c021(this.i2c_device_number, this.i2c_address);
        }
        catch (error) {
            this.warn("Load const adc: " + error);
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
            var voltage_output_object = {};
            voltage_output_object = {};
            try {
                voltage_output_object['i2c_address'] = this.i2c_address;
                voltage_output_object['i2c_device_number'] = this.i2c_device_number;
                var raw_adc = adc.read_adc_value();
                var voltage = adc.read_adc_voltage();
                voltage_output_object['Raw_value'] = raw_adc;
                voltage_output_object['Volts'] = voltage.toFixed(3);
            }
            catch (error) { console.error(error); }
            msg.payload = voltage_output_object;
            node.send(msg);
        });

        this.on('close', function () {
            node.status({ fill: "grey", shape: "ring", text: "adc121c021.status.closed" });
            node.cb.cancel();
            adc121c021.close();
            if (done) { done(); }
        });
    }
    RED.nodes.registerType("adc121c021_i2c", adc121c021MainFunction);
};                    
