module.exports = function(RED) {
    "use strict";
    var Pi4ioe5v96224 = require('./Pi4ioe5v96224');

    function pi4ioe5vInNode(n) {
        RED.nodes.createNode(this,n);

        this.name = n.name || "";
        this.bus = n.bus;
        this.address = n.address;
        this.interval = n.interval;
        this.status({});

        this.port = Math.floor(n.pin / 8);
        this.pin = n.pin % 8;
        var node = this;
        var IoExpander;

        var msg = { topic: node.name + '/' + node.bus + '/' + node.address};

        if (node.pin !== undefined) {
            IoExpander = new Pi4ioe5v96224( parseInt(node.bus),  parseInt(node.address, 16));
            IoExpander.initialize();
        }
        else {
            node.warn(RED._("pi4ioe5v:errors.invalidpin"));
        }

        //poll reading at interval
        node.timer = setInterval(() => {
            msg.payload = IoExpander.getOnePinVal(node.port, node.pin);
            node.send(msg);
        }, node.interval);

        //clear interval on exit
        node.on('close', function() {
            clearInterval(node.timer);
            node.status({fill:"grey",shape:"ring",text:"pi4ioe5v.status.closed"});
            node.cb.cancel();
            IoExpander.close();
            done();
        });
    }
    RED.nodes.registerType("pi4ioe5v in", pi4ioe5vInNode);

    function pi4ioe5vOutNode(n) {
        RED.nodes.createNode(this,n);

        this.name = n.name || "";
        this.bus = n.bus;
        this.address = n.address;
        this.interval = n.interval;
        this.status({});

        this.port = Math.floor(n.pin / 8);
        this.pin = n.pin % 8;
        var node = this;
        var IoExpander;

        var msg = { topic: node.name + '/' + node.bus + '/' + node.address};

        if (node.pin !== undefined) {
            IoExpander = new Pi4ioe5v96224( parseInt(this.bus),  parseInt(this.address, 16));
            IoExpander.initialize();
            node.on("input", inputlistener)
        }
        else {
            node.warn(RED._("pi4ioe5v:errors.invalidpin"));
        }

        function inputlistener(msg) {
                if (msg.payload === "true") { msg.payload = true; }
                if (msg.payload === "false") { msg.payload = false; }
                var out = Number(msg.payload);
                if ((out == 0) || (out == 1)) {
                    IoExpander.setOnePinVal(node.port, node.pin, out);
                    node.status({fill:"green",shape:"dot",text:out.toString()});
                }
                else { node.warn(RED._("pi-gpiod:errors.invalidinput")+": "+out); }
        }

        node.on('close', function() {
            node.status({fill:"grey",shape:"ring",text:"pi4ioe5v.status.closed"});
            IoExpander.close();
            done();
        });
    }
    RED.nodes.registerType("pi4ioe5v out", pi4ioe5vOutNode);
}
