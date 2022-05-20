module.exports = function(RED) {
	"use strict";
	const headerLength = 3;
	const checkSumLength = 1;
	const sync = 0x55;

	function protectID(ident) {
		var pid = ident & 0x3F;
		var tmp = (pid ^ (pid>>1) ^ (pid>>2) ^ (pid>>4)) & 0x01;
		pid |= tmp << 6;
		tmp = ~((pid>>1) ^ (pid>>3) ^ (pid>>4) ^ (pid>>5)) & 0x01;
		pid |= tmp << 7;
		return pid;
	}

	function calculateChecksum(data) {
		var chk = 0;
		for(var i = 0; i < data.length; i++) {
			chk += data[i];
			if (chk > 255) {
				chk -= 255;
			}
		}
		chk = 255 - chk;
		return chk;
	}
	function validateChecksum(data, checkSum) {
		return calculateChecksum(data) == checkSum;
	}
	
	function linBusParseNode(config) {
		RED.nodes.createNode(this,config);
	
		this.on("input", function(msg) {
			//clear status icon every new trigger input
			this.status({}); 
			var newMsg = {};
			newMsg.payload = [];
			var rawData = msg.payload;
			var payloadLength = parseInt(config.length);
			var frameLength = headerLength + payloadLength + checkSumLength;
		
			while (rawData.length >= frameLength) {
			
				if (rawData[0] == 0 && rawData[1] == sync && rawData[2] == protectID(config.ID)) {
					var payloadData = rawData.slice(headerLength, headerLength+payloadLength);
					var checkSum = rawData[headerLength+payloadLength];

					if (validateChecksum(payloadData, checkSum)) {
						var tmp = {ID:parseInt(config.ID), length:payloadLength, data:payloadData};
						newMsg.payload.push(tmp);
					}
					rawData = rawData.slice(frameLength, rawData.length);
				} 
				else {
					rawData = rawData.slice(1, rawData.length);
				}
			}

			this.send(newMsg);
		});
	
 		this.on('close', function() {
			this.status({fill:"grey", shape:"ring", text:"linbus.status.closed"});
			this.cb.cancel();
			if (done) { done(); }
		});
	}
	RED.nodes.registerType("linbus-parse", linBusParseNode);

	function linBusBuilderNode(config) {
		RED.nodes.createNode(this,config);

		this.on("input", function(msg) {
			this.status({}); 
			var newMsg = {};
			var length = msg.payload.length;
			if (length == 2 || length == 4 || length == 8 ) {
				var pid = protectID(config.ID);
				var header = Buffer.from([0, sync, pid]);  
				var checkSum = calculateChecksum(msg.payload);
				checkSum = Buffer.from([checkSum]);
				var frame = Buffer.concat([header, msg.payload, checkSum]);
				newMsg.payload = frame;
				this.send(newMsg);
			}
		});

		this.on('close', function() {
			this.status({fill:"grey", shape:"ring", text:"linbus.status.closed"});
			this.cb.cancel();
			if (done) { done(); }
		});
	}
	RED.nodes.registerType("linbus-builder", linBusBuilderNode);
}
