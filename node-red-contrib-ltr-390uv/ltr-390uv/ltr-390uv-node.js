/* ltr-390uv node
const __copyright__ = "Copyright 2022, RAKwireless"
const __license__ = "MIT"
const __version__ = "0.0.1"
const __status__ = "Production"
*/
// Licensed under the MIT License
// rakwireless.com

module.exports = function (RED) {
    let LTR_390UV = require('./ltr-390uv');
    function ltr_390uv_main_function(config) {
        RED.nodes.createNode(this, config);
        // config
        this.i2c_device_number = parseInt(config.i2c_device_number, 10);
        this.i2c_address = parseInt(config.i2c_address);
        this.gain = parseInt(config.gain);
        this.resolution = parseInt(config.resolution);

        //clear status icon if one is hanging about when you deploy the node
        this.status({});
                                      
        function sleep(delay) 
	    {
        	let endTime = new Date().getTime()+parseInt(delay);
        	while (new Date().getTime() < endTime );
	    }

        var ltr_390uv;
        try {
            ltr_390uv = new LTR_390UV(this.i2c_device_number, this.i2c_address);
            ltr_390uv.set_als_uvs_gain(this.gain);
            ltr_390uv.set_als_uvs_resolution(this.resolution);
        }
        catch (error) {
            this.warn("config ltr_390uv: " + error);
            this.status({
                fill: 'red',
                shape: 'dot',
                text: "detected error"
            });
        }
   
        //DO STUFF WHEN TRIGGERED                                          
        this.on("input", function (msg) {
            //clear status icon every new trigger input             
            this.status({});
            // create object to store lux and uvi;            
            var output_object = {};
            //measure als
            ltr_390uv.set_als_uvs_mode(0);
            sleep(50);
            var als = ltr_390uv.read_als_data();
            var lux = ltr_390uv.calculate_lux(als, this.gain, this.resolution);
            //measure uvs
            ltr_390uv.set_als_uvs_mode(1);
            sleep(50);            
            var uvs = ltr_390uv.read_uvs_data();
            var uvi = ltr_390uv.calculate_uvi(uvs, this.gain, this.resolution);
            try {
                output_object['als'] = als;
                output_object['lux'] = lux.toFixed(2);
                output_object['uvs'] = uvs;
                output_object['uvi'] = uvi.toFixed(2);
            }
            catch (error) { console.error(error); }
            msg.payload = output_object;
            this.send(msg);
        });

        this.on('close', function () {
            this.status({ fill: "grey", shape: "ring", text: "ltr-390uv.status.closed" });
            this.cb.cancel();
            if (done) { done(); }
        });
    }
    RED.nodes.registerType("ltr-390uv", ltr_390uv_main_function);
};                    