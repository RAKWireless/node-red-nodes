let pn532 = require('./pn532_i2c');   
sensor = new pn532(1, 0x24); 
let uid = sensor.read_passive_target(timeout=0.5);      
console.log(uid);

let key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];
let authenticated = sensor.mifare_classic_authenticate_block(uid, 4, 0x61, key);
let data = sensor.mifare_classic_read_block(4);
console.log(data);      
