// Licensed under the MIT License
// rakwireless.com

module.exports = function (RED) {
    let pn532 = require('./pn532_i2c');

    function pn532Config(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.busNum = parseInt(config.busNum);
        this.addr = parseInt(config.addr, 16);

        let global_i2c_bus_RW_ctx = this.context().global;

        if (global_i2c_bus_RW_ctx.get("sensor") == null) {
            try {
                sensor = new pn532(this.busNum, this.addr);
            }
            catch (error) {
                node.warn("Load const pn532: " + error);
                node.status({
                    fill: 'red',
                    shape: 'dot',
                    text: "detected error"
                });
            }
            global_i2c_bus_RW_ctx.set('sensor', sensor);
        }
        this.on('close', function () {
            try {
                global_i2c_bus_RW_ctx.set("sensor", undefined); // clearing global context           
            } catch { }
        });
    }

    RED.nodes.registerType("pn532_i2c_config", pn532Config);

    function pn532Read(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // config
        node.block = parseInt(config.block);

        //clear status icon if one is hanging about when you deploy the node
        status_clear({});

        //Function to Clear user notices, used for timmer
        function status_clear() {
            //clear status icon
            node.status({});
        };


        //DO STUFF WHEN TRIGGERED
        node.on("input", function (msg) {
            //clear status icon every new trigger input
            node.status({});
            let global_i2c_bus_RW_ctx = this.context().global;
            sensor = global_i2c_bus_RW_ctx.get("sensor");
            let uid = sensor.read_passive_target(timeout = 0.5);
            if (uid) {
                msg.payload = {};
                msg.payload.uid = uid;
                msg.payload.block_num = node.block;
                let key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
                let authenticated = sensor.mifare_classic_authenticate_block(uid, node.block, 0x61, key);
                let data = sensor.mifare_classic_read_block(node.block);
                msg.payload.block_data = data;
                node.send(msg);
            }
        });

        this.on('close', function () {
            node.status({ fill: "grey", shape: "ring", text: "pn532.status.closed" });
            node.cb.cancel();
            node.sensor.close();
            if (done) { done(); }
        });
    }

    RED.nodes.registerType("pn532_i2c_read", pn532Read);

    function pn532Write(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // config                                                                                        
        node.block = parseInt(config.block);

        //clear status icon if one is hanging about when you deploy the node                             
        status_clear({});

        //Function to Clear user notices, used for timmer                                                
        function status_clear() {
            //clear status icon                                                                          
            node.status({});
        };

        //DO STUFF WHEN TRIGGERED                                                                        
        node.on("input", function (msg) {
            //clear status icon every new trigger input                                                  
            node.status({});
            let global_i2c_bus_RW_ctx = this.context().global;
            sensor = global_i2c_bus_RW_ctx.get("sensor");
            let uid = sensor.read_passive_target(timeout = 0.5);
            if (uid) {
                let key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
                let authenticated = sensor.mifare_classic_authenticate_block(uid, node.block, 0x61, key);
                let ret = sensor.mifare_classic_write_block(node.block, msg.payload);
                if (ret) {
                    msg.error = 0;
                } else {
                    msg.error = 1;
                }
                node.send(msg);
            }
        });

        this.on('close', function () {
            node.status({ fill: "grey", shape: "ring", text: "pn532.status.closed" });
            node.cb.cancel();
            node.sensor.close();
            if (done) { done(); }
        });
    }

    RED.nodes.registerType("pn532_i2c_write", pn532Write);
};
