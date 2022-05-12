// Licensed under the MIT License
// rakwireless.com

module.exports = function(RED) {
    let lps2x = require('./LPS2X');
    function lps2xMainFunction(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // config
        node.i2c_device_number = parseInt(config.i2c_device_number);
		node.dev = parseInt(config.chip);
        node.i2c_address = parseInt(config.i2c_address, 16);
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
            node.sensor = new lps2x(node.i2c_device_number, node.dev, node.i2c_address);
        }
        catch (error) {
            node.warn("Load const lps2x: " + error);
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
            
            let data = node.sensor.get();
			msg.payload = {"Temperature": "0 °C", "Pressure": "0 hpa"}
			msg.payload.Temperature = (data[0]).toFixed(2) + ' °C';
			msg.payload.Pressure = (data[1]).toFixed(2) + ' hPa';
            node.send(msg);
        });

        this.on('close', function() {
            node.status({fill:"grey",shape:"ring",text:"lps2x.status.closed"});
            node.cb.cancel();
            node.sensor.close();
            if (done) { done(); }
        });
    }
    RED.nodes.registerType("lps2x_i2c", lps2xMainFunction);
};
