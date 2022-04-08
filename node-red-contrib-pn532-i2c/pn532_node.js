// Licensed under the MIT License
// rakwireless.com

module.exports = function(RED) {
    let pn532 = require('./pn532_i2c');
    function pn532MainFunction(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // config
        node.i2c_device_number = parseInt(config.i2c_device_number);
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
            node.sensor = new pn532(node.i2c_device_number, node.i2c_address);
        }
        catch (error) {
            node.warn("Load const pn532: " + error);
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
            msg.payload = node.sensor.read_passive_target(timeout=0.5);
			if(msg.payload) {
				node.send(msg);
			}
        });

        this.on('close', function() {
            node.status({fill:"grey",shape:"ring",text:"pn532.status.closed"});
            node.cb.cancel();
            node.sensor.close();
            if (done) { done(); }
        });
    }
    RED.nodes.registerType("pn532_i2c", pn532MainFunction);
};
