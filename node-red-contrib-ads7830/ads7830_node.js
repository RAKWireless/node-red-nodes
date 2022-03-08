
// Licensed under the MIT License
// rakwireless.com

module.exports = function(RED) {
    let ads7830 = require('./ads7830');
    function ads7830MainFunction(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // config
        this.i2c_device_number = parseInt(config.i2c_device_number, 10);
        this.i2c_address = parseInt(config.i2c_address, 16);
        this.inputsForChannel = config.inputsForChannel;
        this.singleEndedChannel0 = config.singleEndedChannel0;
        this.singleEndedChannel1 = config.singleEndedChannel1;
        this.singleEndedChannel2 = config.singleEndedChannel2;
        this.singleEndedChannel3 = config.singleEndedChannel3;
        this.singleEndedChannel4 = config.singleEndedChannel4;
        this.singleEndedChannel5 = config.singleEndedChannel5;
        this.singleEndedChannel6 = config.singleEndedChannel6;
        this.singleEndedChannel7 = config.singleEndedChannel7;
        this.differentialChannel0_1 = config.differentialChannel0_1;
        this.differentialChannel2_3 = config.differentialChannel2_3;
        this.differentialChannel4_5 = config.differentialChannel4_5;
        this.differentialChannel6_7 = config.differentialChannel6_7;
        this.differentialChannel1_0 = config.differentialChannel1_0;
        this.differentialChannel3_2 = config.differentialChannel3_2;
        this.differentialChannel5_4 = config.differentialChannel5_4;
        this.differentialChannel7_6 = config.differentialChannel7_6;
        this.internalReferenceOnOff = config.internalReferenceOnOff;
        this.ADConverterOnOff = config.ADConverterOnOff;

        var dply_rdy = true;

        const format_inputsForChannel = this.inputsForChannel;

        //populate channels_array_of_objects
        var channels_array_of_objects = [];
        if (format_inputsForChannel === 'singleEnded') {
            if (this.singleEndedChannel0 === true) {
                channels_array_of_objects.push({channel: 0});
            }
            if (this.singleEndedChannel1 === true) {
                channels_array_of_objects.push({channel: 1});
            }
            if (this.singleEndedChannel2 === true) {
                channels_array_of_objects.push({channel: 2});
            }
            if (this.singleEndedChannel3 === true) {
                channels_array_of_objects.push({channel: 3});
            }
            if (this.singleEndedChannel4 === true) {
                channels_array_of_objects.push({channel: 4});
            }
            if (this.singleEndedChannel5 === true) {
                channels_array_of_objects.push({channel: 5});
            }
            if (this.singleEndedChannel6 === true) {
                channels_array_of_objects.push({channel: 6});
            }
            if (this.singleEndedChannel7 === true) {
                channels_array_of_objects.push({channel: 7});
            }

            if (channels_array_of_objects.length == 0){
                this.warn("No Single Ended Channels Selected: Please Select a Channel");
                dply_rdy = "No Single Ended Channels Selected: Please Select a Channel";
            }
        } else if (format_inputsForChannel === 'differential') {
            if (this.differentialChannel0_1 === true) {
                channels_array_of_objects.push({channelPositive: 0, channelNegative: 1});
            }
            if (this.differentialChannel2_3 === true) {
                channels_array_of_objects.push({channelPositive: 2, channelNegative: 3});
            }
            if (this.differentialChannel4_5 === true) {
                channels_array_of_objects.push({channelPositive: 4, channelNegative: 5});
            }
            if (this.differentialChannel6_7 === true) {
                channels_array_of_objects.push({channelPositive: 6, channelNegative: 7});
            }			
            if (this.differentialChannel1_0 === true) {
                channels_array_of_objects.push({channelPositive: 1, channelNegative: 0});
            }
            if (this.differentialChannel3_2 === true) {
                channels_array_of_objects.push({channelPositive: 3, channelNegative: 2});
            }
            if (this.differentialChannel5_4 === true) {
                channels_array_of_objects.push({channelPositive: 5, channelNegative: 4});
            }
            if (this.differentialChannel7_6 === true) {
                channels_array_of_objects.push({channelPositive: 7, channelNegative: 6});
            }           
            if (channels_array_of_objects.length == 0){
                this.warn("No Differential Channels Selected: Please Select a Channel");
                dply_rdy = "No Differential Channels Selected: Please Select a Channel";
            }
        }
        else {
            this.warn("Channel Mode is wrong");
            dply_rdy = "Channel Mode is wrong";
        }

        //clear status icon if one is hanging about when you deploy the node
        status_clear({});

        //Function to Clear user notices, used for timmer
        function status_clear() {
            //clear status icon
            node.status({});
        };

        //setup the ads
        var adc;
        try {
            adc = new ads7830(this.i2c_device_number, this.i2c_address);
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
        this.on("input", function(msg) {
            //clear status icon every new trigger input
            node.status({});
			// create object to store voltage values
			var voltage_output_object = {};
			voltage_output_object = {};
			voltage_output_object[format_inputsForChannel] = {};

			if (format_inputsForChannel === 'singleEnded') {
				for (let request of channels_array_of_objects) {
					try {
						voltage_output_object[format_inputsForChannel]['channel_'+request.channel] = {};
						const measure = adc.readSingleEnded(
							request.channel, 
							this.internalReferenceOnOff, 
							this.ADConverterOnOff
						);
						voltage_output_object[format_inputsForChannel]['channel_'+request.channel]['Volts'] = (measure*3/ 255).toFixed(2);
					}
					catch (error) { console.error(error); }
				}
			}
			if (format_inputsForChannel === 'differential') {
				for (let request of channels_array_of_objects) {
					try {
						voltage_output_object[format_inputsForChannel]['channel_'+request.channelPositive+'_'+request.channelNegative] = {};
						const measure = adc.readDifferential(
							request.channelPositive,
							request.channelNegative,
							this.internalReferenceOnOff, 
							this.ADConverterOnOff
						);
						voltage_output_object[format_inputsForChannel]['channel_'+request.channelPositive+'_'+request.channelNegative]['Volts'] =  (measure*3/ 255).toFixed(2);;
					}
					catch (error) { console.error(error); }
				}
			}
			//send voltage_output_object to payload
			// RED.util.setMessageProperty(msg, node.property, voltage_output_object);
			msg.payload = voltage_output_object;
			node.send(msg);
        });

        this.on('close', function() {
            node.status({fill:"grey",shape:"ring",text:"ads7830.status.closed"});
            node.cb.cancel();
            ads7830.close();
            if (done) { done(); }
        });
    }
    RED.nodes.registerType("ads7830_i2c", ads7830MainFunction);
};
