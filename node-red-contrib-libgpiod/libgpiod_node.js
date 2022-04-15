// Licensed under the MIT License
// rakwireless.com

module.exports = function(RED) {
    // const { version, Chip, Line } = require("node-libgpiod");
	var exec = require('child_process').exec;
    function libgpiodMainFunction(config) {
        RED.nodes.createNode(this, config);
        // config
		let node = this;
        node.gpiochip_dev = parseInt(config.gpiochip_dev);
        node.gpio_port = parseInt(config.gpio_port);
        node.gpio_direction = parseInt(config.gpio_direction);
		
        //clear status icon if one is hanging about when you deploy the node
        node.status({});

        //DO STUFF WHEN TRIGGERED
        node.on("input", function(msg) {
			//clear status icon every new trigger input
			node.status({});
			let val = parseInt(msg.payload);
			// let origin_val = node.port.getValue();
			try {
				exec('python ./libgpio.py '+ node.gpiochip_dev+' '+node.gpio_port+' '+node.gpio_direction+' '+val,
				function(error,stdout,stderr){
					if(error) {
						msg.payload = stderr;
						node.status({
							fill: 'red',
							shape: 'dot',
							text: msg.payload
						});
						node.send(msg);
					} else {
						if(stdout.length > 1){
							// msg.payload = JSON.parse(stdout.trim());
							msg.payload = JSON.parse(stdout.trim().replace(/'/g, '"'));
							node.send(msg);
							node.status({
								fill: 'green',
								shape: 'dot',
								text: msg.payload.value
							});
						}
					}
				});
			} catch(e) {}
        });

        node.on('close', function() {
			try {
				node.status({fill:"grey",shape:"ring",text:"libgpiod.status.closed"});
				node.cb.cancel();
				if (done) { done(); }
			} catch(e) {}
        });
    }
    RED.nodes.registerType("libgpiod", libgpiodMainFunction);
};
