// Licensed under the MIT License
// rakwireless.com

module.exports = function(RED) {
    let shtc3 = require('./shtc3');
    function shtc3MainFunction(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // config
        node.i2c_device_number = parseInt(config.i2c_device_number);
        node.i2c_address = parseInt(config.i2c_address, 16);
		node.temp_unit = config.temperature_unit;
		node.sensor = null;
		

        //clear status icon if one is hanging about when you deploy the node
        status_clear({});

        //Function to Clear user notices, used for timmer
        function status_clear() {
            //clear status icon
            node.status({});
        };

        //setup the ads
        try {
            node.sensor = new shtc3(node.i2c_device_number, node.i2c_address);
        }
        catch (error) {
            node.warn("Load const shtc3: " + error);
            node.status({
                fill: 'red',
                shape: 'dot',
                text: "detected error"
            });
        }

        //DO STUFF WHEN TRIGGERED
        node.on("input", function(msg) {
            //clear status icon every new trigger input
            node.status({});
			
			//send voltage_output_object to payload
			// RED.util.setMessageProperty(msg, node.property, voltage_output_object);
			if(node.temp_unit == 'fahrenheit') {
				node.temp_unit = 1;
			} else {
				node.temp_unit = 0;
			}
			
			msg.payload = node.sensor.get_temperature_humidity(node.temp_unit);
			node.send(msg);
        });

        this.on('close', function() {
            node.status({fill:"grey",shape:"ring",text:"shtc3.status.closed"});
            node.cb.cancel();
            node.sensor.close();
            if (done) { done(); }
        });
    }
    RED.nodes.registerType("shtc3_i2c", shtc3MainFunction);
};
