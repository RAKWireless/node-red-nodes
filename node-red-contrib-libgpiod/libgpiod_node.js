// Licensed under the MIT License
// rakwireless.com

module.exports = function(RED) {
    const { version, Chip, Line } = require("node-libgpiod");
    function libgpiodMainFunction(config) {
        RED.nodes.createNode(this, config);
        // config
		let node = this;
        node.gpiochip_dev = parseInt(config.gpiochip_dev);
        node.gpio_port = parseInt(config.gpio_port);
        node.gpio_direction = parseInt(config.gpio_direction);
		
        //clear status icon if one is hanging about when you deploy the node
        node.status({});

		node.chip = new Chip(node.gpiochip_dev);
		node.port = new Line(node.chip, node.gpio_port);
		
		try {
			if(node.gpio_direction == 1) {
				node.port.requestOutputMode();
			} else {
				node.port.requestInputMode();
			}
		} catch(e) {
			console.log('11111111111111111');
		}

        //DO STUFF WHEN TRIGGERED
        node.on("input", function(msg) {
			//clear status icon every new trigger input
			node.status({});
			let val = parseInt(msg.payload);
			let origin_val = node.port.getValue();
			try {
				if(node.gpio_direction == 1) {
					if(origin_val != val) {
						node.port.setValue(val);
						origin_val = val;
					}
				}
				
				node.status({
					fill: 'green',
					shape: 'dot',
					text: origin_val
				});
			} catch(e) {}
			
			node.send({'payload': {
					'chip': 'gpiochip'+node.gpiochip_dev,
					'gpio': node.gpio_port,
					'direction': node.gpio_direction == 1 ? 'Output' : 'Input',
					'value':origin_val
				}
			});
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
