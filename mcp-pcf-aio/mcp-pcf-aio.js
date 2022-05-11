'Strict mode'

debugger

// const { normalize } = require("path");
// const { abort } = require("process");
// const { isNumberObject } = require("util/types");

// Read more: 

// CHIP SECTION - For inputs this reads the chip and fires the input module 
//	https://ww1.microchip.com/downloads/en/devicedoc/20001952c.pdf

// NodeRED forum about enhancing this component: 
//	https://discourse.nodered.org/t/node-red-contrib-mcp23017chip/37999

// For lisencing >> see Lisence file in the upper directory.

	// * 1 = Pin is configured as an input.
	// * 0 = Pin is configured as an output.
	// * See "3.5.1 I/O Direction register".


	//		*** chip initialisation (IOCON values) *** //
	//			... enables "byte mode" (IOCON.BANK = 0 and IOCON.SEQOP = 0).

	//bit7 BANK		= 	0 : sequential register addresses (See PDF: Table 3-3)
	//bit6 MIRROR	= 	0 : use configure Interrupt 
	//bit5 SEQOP	= 	0 : sequential operation disabled, address pointer does not increment
	//bit4 DISSLW	= 	0 : The "Slew Rate" bit controls the slew rate function on the SDA pin. If enabled, the SDA slew rate will be controlled when driving from a high to low.
	//bit3 HAEN		= 	0 : hardware address pin is always enabled on 23017
	//bit2 ODR		= 	0 : open drain output.  Enables/disables the INT pin for open-drain configuration. Setting this bit overrides the INTPOL bit.
	//bit1 INTPOL	= 	0 : interrupt active low (Sets the polarity of the INT pin. This bit is functional only when the ODR bit is cleared, configuring the INT pin as active push-pull)
	//bit0 xxx unused
	//       for example SEQOP = 1:   write ( addr, IOCON, 0b00100000 ); = 32 dec = 0x20


module.exports = function(RED) {

	const busStateTexts = [
		"Opening i2c Bus",			// 0 ... actually this is done only virtually, the opening happens only at first read/write
		"Reading current state",	// 1
		"Writing byte",				// 2
		"Closing i2c bus"];			// 3

	const log2consol = true;	// enabling it shows detailed logs in:  node-red-log
	const timerLog   = false; // !! WARNING !!   << if true, it will fill up the log with ALL read events (up to 50x3 msg. pro sec !! if read interval is 20ms)


	// IOCON.BANK = 0 mode << !!! Using this is NOT recommended, because it causing "sequential read" of A/B bank, not a fixed side 
	const BNK0_IODIR_A		= 0x00; 	//< Controls the direction of the data Input/Output for port A.
	const BNK0_IODIR_B		= 0x01;		//< Controls the direction of the data Input/Output for port B.
	const BNK0_IPOL_A		= 0x02;		//< Configures the polarity on the corresponding GPIO_ port bits for input port A.
	const BNK0_IPOL_B		= 0x03;		//< Configures the polarity on the corresponding GPIO_ port bits for input port B.
	const BNK0_GPINTEN_A	= 0x04;		//< Controls the input interrupt-on-change for each pin of port A.
	const BNK0_GPINTEN_B	= 0x05;		//< Controls the input interrupt-on-change for each pin of port B.
	const BNK0_DEFVAL_A		= 0x06;		//< Controls the default comparison value for interrupt-on-change for port A.
	const BNK0_DEFVAL_B		= 0x07;		//< Controls the default comparison value for interrupt-on-change for port B.
	const BNK0_INTCON_A		= 0x08;		//< Controls how the associated pin value is compared for the interrupt-on-change for port A.
	const BNK0_INTCON_B		= 0x09;		//< Controls how the associated pin value is compared for the interrupt-on-change for port B.
	const BNK0_IOCON_A		= 0x0A;		//< Controls the device. (0, INTPOL, ODR, HAEN, DISSLW, SEQOP, MIRROR, BANK) = 0x0B too
	const BNK0_IOCON_B		= 0x0B;		//< Controls the device. (0, INTPOL, ODR, HAEN, DISSLW, SEQOP, MIRROR, BANK) = 0x0B too
	const BNK0_GPPU_A		= 0x0C;		//< Controls the input pull-up resistors for the port A pins.
	const BNK0_GPPU_B		= 0x0D;		//< Controls the input pull-up resistors for the port B pins.
	const BNK0_INTF_A		= 0x0E;		//< Reflects the input interrupt condition on the port A pins.
	const BNK0_INTF_B		= 0x0F;		//< Reflects the input interrupt condition on the port B pins.
	const BNK0_INTCAP_A		= 0x10;		//< Captures the port A value at the time the interrupt occurred.
	const BNK0_INTCAP_B		= 0x11;		//< Captures the port B value at the time the interrupt occurred.
	const BNK0_GPIO_A		= 0x12;		//< Reflects the value on the port A.
	const BNK0_GPIO_B		= 0x13;		//< Reflects the value on the port B.
	const BNK0_OLAT_A		= 0x14;		//< Provides access to the port A output latches.
	const BNK0_OLAT_B		= 0x15;		//< Provides access to the port B output latches.

// The following register addresses assume IOCON.BANK = 1 		<< THIS IS what this program is using
	const BNK1_IODIR_A   = 0x00;
	const BNK1_IPOL_A    = 0x01;
	const BNK1_GPINTEN_A = 0x02;
	const BNK1_DEFVAL_A  = 0x03;
	const BNK1_INTCON_A  = 0x04;
	const BNK1_IOCON_A   = 0x05;
	const BNK1_GPPU_A    = 0x06;
	const BNK1_INTF_A    = 0x07;
	const BNK1_INTCAP_A  = 0x08;
	const BNK1_GPIO_A    = 0x09;
	const BNK1_OLAT_A    = 0x0A;
	
	const BNK1_IODIR_B   = 0x10;
	const BNK1_IPOL_B    = 0x11;
	const BNK1_GPINTEN_B = 0x12;
	const BNK1_DEFVAL_B  = 0x13;
	const BNK1_INTCON_B  = 0x14;
	const BNK1_IOCON_B   = 0x15;
	const BNK1_GPPU_B    = 0x16;
	const BNK1_INTF_B    = 0x17;
	const BNK1_INTCAP_B  = 0x18;
	const BNK1_GPIO_B    = 0x19;
	const BNK1_OLAT_B    = 0x1A;

	var i2cModule = require("i2c-bus"); // https://github.com/fivdi/i2c-bus
	var process   = require('process');
	const performance = require('perf_hooks').performance;

	process.on('uncaughtException', (err, origin) => {
		console.error( "!!! Unhandled error in MPC23017/PCF8574 node-red module.   >> " + err + "   >> ORIGIN: " + origin );
	});


	// *** Bit manipulation functions:

	//Get bit
	function getBit(number, bitPosition) {
		return (number & (1 << bitPosition)) === 0 ? 0 : 1;
	}
	
	//Set Bit
	function setBit(number, bitPosition) {
		return number | (1 << bitPosition);
	}
	
	//Clear Bit
	function clearBit(number, bitPosition) {
		const mask = ~(1 << bitPosition);
		return number & mask;
	}
	
	//Update Bit
	function updateBit(number, bitPosition, bitValue) {
		const bitValueNormalized = bitValue ? 1 : 0;
		const clearMask = ~(1 << bitPosition);
		return (number & clearMask) | (bitValueNormalized << bitPosition);
	}
	
  


	function showState (_obj, _onOffState, _errorState) {
		// _errorState:  if address is taken or a global error occurred while trying read/write to the chip	
		if (log2consol) console.log("  ...state update >>  _onOffState: " + _onOffState +"   globalState= "+ _errorState + "  Node_id=" + _obj.id);

		if ((_errorState >= 2) || (_onOffState == -2)) { // ERROR  !
			// it is impossible to determine if a bus is existing and working, so the whole chip will be set into "error state"
						_obj.status({fill:"red"   ,shape:"dot" ,text:"! Error." + _errorState >= 2 ? " Re-test:" + _errorState + "sec" : ""});
		}
		else
		{
			if (_errorState == 0) { // Uninitialized
						_obj.status({fill:"yellow",shape:"ring",text:"unknown yet"});
			}
			else
			{
				if (_errorState == 1) { // Working :-)
					const _onOff = _obj.invert ? !_onOffState : _onOffState;
					if (_onOff == true) {
						_obj.status({fill:"green" ,shape:"dot" ,text:"On"});
					}else
					if (_onOff == false){
						_obj.status({fill:"grey"  ,shape:"ring",text:"Off"});
					}
				}
			}
		}
	}

	function sleep(delay)
	{
		let endTime = new Date().getTime()+parseInt(delay);
		while (new Date().getTime() < endTime );
	}


	function mcp_pcf_chipNode(n) {
		RED.nodes.createNode(this, n);
		var mainChipNode = this;

		this.busNum         = parseInt(n.busNum, 10); // converts string to decimal (10)
		this.addr           = parseInt(n.addr  , 16); // converts from HEXA (16) to decimal (10)
		this.reset			= parseInt(n.reset , 10);
		if (isNaN(this.addr)) {this.addr  = 0x20; }
		this.MaxBits		= (this.addr >= 0x40 ? 8 : 16);
		this.isInputs       = 0x0000;	// which ports are input ports (saved in binary form)
		this.pullUps        = 0x0000;  
//		this.inverts        = 0x0000;
		this.startAllHIGH   = n.startAllHIGH; // Some relay boards are negated. (HIGH = OFF)
		this.ids            = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]; //Array(16)
		this.globalState    = 0;  // 0=uninitialized  1=working: on/off=see:ids    2=error
		this.errorCount		= 0;
		this.AllStates  	= -1; // 0x0000;
		this.lastTimeRed    = 0;  // when was the last time a successfull a full 16bit READ operation happened (inputs)
		this.readLength		= 0;  // how long did it take the last read sequence (inputs)(ms)

		// Timer related variables:
		this.interval       = 0 + n.interval;
		if ((this.interval < 20) && (this.interval != 0)) this.interval = 20; // one readout takes at least 8 ms x2 banks 
		this.origInterv     = this.interval;

		this.chipTimer      = null;
		this.timerIsRunning = false;
		this.rwIsHappening	= false;		// global atomic bool (TODO for later)

        const { Chip, Line } = require("node-libgpiod");
		
		// *** GLOBAL RW context *** //
		// >> to prevent Read-Write operations happening at the same time on the same i2c Bus.
		let   global_i2c_bus_RW_ctx = this.context().global;
		const _i2c_ctx_name =  "i2c"+ this.busNum + "RW";
		
		if(global_i2c_bus_RW_ctx.get("chip") == null) {
			chip = new Chip("gpiochip0");
            console.log(chip)
			global_i2c_bus_RW_ctx.set('chip', chip);

		}

		if(global_i2c_bus_RW_ctx.get("line") == null) {
       		line = new Line(chip, this.reset);
            console.log(line); 
			global_i2c_bus_RW_ctx.set("line", line);
			line.requestOutputMode();
        	line.setValue(0);
        	sleep(100);
        	line.setValue(1);
        	sleep(100);

        }

		if (global_i2c_bus_RW_ctx.get(_i2c_ctx_name) == null) { 
			if (log2consol) console.log("  MCP/FCP context does not exists yet. Creating now: " + _i2c_ctx_name);
			global_i2c_bus_RW_ctx.set(_i2c_ctx_name, false);
		}
		else if (log2consol) console.log("  MCP/FCP context does exists already: " + _i2c_ctx_name );

		// TODO: block RW operations happening at the same time...

		this.RW_check = function() {
			if ( mainChipNode.rwIsHappening ) return false;
			if (global_i2c_bus_RW_ctx.get(_i2c_ctx_name) == null) return false;
			mainChipNode.rwIsHappening = true;
			global_i2c_bus_RW_ctx.set(_i2c_ctx_name, true);
			return true;
		}
		this.RW_finish = function() {
			mainChipNode.rwIsHappening = false;
			global_i2c_bus_RW_ctx.set(_i2c_ctx_name, false);
		}


		if (log2consol) console.log("  MCP/PCF chip initialization OK. BusNumber=" + this.busNum + " Address=" + this.addr + "  id:" + this.id);
		
		/*
		// Sleep 4ms to wait for rwIsHappening gets false again
		const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
		const waitForPrevOperationToFinish = async () => {
			let maxTimeout = 0;
			while ((maxTimeout < 40) && this.rwIsHappening) {
				await sleep(4);
				maxTimeout += 4;
			}
			return;
		} */

		this.initializeBit = function(_bitNum, _isInput, _pullUp, _callerNode){
			const _parCh = _callerNode.parentChip;			
			if (log2consol) console.log("  MCP/PCF init-Bit started... Addr=" + _parCh.addr + "  bitNum=" + _bitNum + "  isInput=" + _isInput + "  pullUp=" + _pullUp + "  startAllHigh=" + _parCh.startAllHIGH + "  LastState="+ _callerNode.lastState);

			if (_parCh.ids[_bitNum] != null ) {
				if (log2consol) console.log("!!MCP chip-node-ids[_bitNum] != null ALREADY exists a node for this Bit set:" + _parCh.ids[_bitNum]);
				if (_parCh.ids[_bitNum] != _callerNode.id ) { 
					if (log2consol) console.log("!!MCP chip-node-ids[_bitNum] != _callerNode.id =" + _callerNode.id );
					_callerNode.lastState = -2; 	// error state
					showState(_callerNode, -2, 2); // show red error status at the corner of the Node
					_callerNode.error("!!MCP/PCF pin is already used by an other node:  Bit=" + _bitNum + "bus=" + _parCh.busNum + " addr=" + _parCh.addr); 					
					return false;
				} // 
			}

			for (var i=0; i < _parCh.MaxBits; i++){ //NEED TO REMOVE ANY OTHER REFERENCES TO THIS ID  (MaxBits= 8 or 16)
				if (_parCh.ids[i] == _callerNode.id)  { _parCh.ids[i] = null; }
			}
			
			_parCh.ids[_bitNum] = _callerNode.id; // remember, which pin (bitNum) is this Node assigned to. 			

			if ( ! _parCh.RW_check() ) return false;

			let _processState = 0;

			try {

				let aBus = i2cModule.openSync(_parCh.busNum);

					// *** PCF8574 or PCF8574A chip  *** //
				if (_parCh.addr >= 0x40) {
					if ((_parCh.startAllHIGH == true) && (_callerNode.lastState = -2)){
						if (log2consol) console.log("  PCF Now Setting ALL pins to HIGH. A+B = 1111111111111111 Addr=" + Math.ceil( _parCh.addr / 2 ));
						aBus.sendByteSync( Math.ceil( _parCh.addr / 2 ), 0xFF);
						_parCh.lastTimeRed = performance.now();
						_parCh.AllStates 	= 0xFF;
						_parCh.startAllHIGH = false; // 1x running is enough. Turn it off now.
					}
					else {
						_parCh.AllStates = aBus.receiveByteSync( Math.ceil( _parCh.addr / 2 ) );
					}
				}
				else 
				{ 	// *** MCP23017 Chip  *** //

						function bbb () {
							let bank0 = -1;  let bank1 = -1; 
							bank0 = aBus.readByteSync(_parCh.addr, BNK0_IOCON_B);
							bank1 = aBus.readByteSync(_parCh.addr, BNK1_IOCON_A);

							console.log("************** Bank IOCON_B_BNK0=" + bank0.toString(2) + "  *********  Bank IOCON_A_BNK1=" + bank1.toString(2));
							console.log("**** A0=" + aBus.readByteSync(_parCh.addr, BNK0_OLAT_A).toString(2) + "   B0=" + aBus.readByteSync(_parCh.addr, BNK0_OLAT_B).toString(2));
							console.log("**** A1=" + aBus.readByteSync(_parCh.addr, BNK1_OLAT_A).toString(2) + "   B1=" + aBus.readByteSync(_parCh.addr, BNK1_OLAT_B).toString(2));
						}
						// First forcing chip's IOCON.Bank=1 mode twice, so it WILL be =1 .
					//bbb();
					aBus.writeByteSync(_parCh.addr, BNK0_IOCON_B	, 0xA0); //set mode IOCON bank to 8bit mode  See:Page-17 TABLE 3-4 at chip PDF
					//bbb();
					aBus.writeByteSync(_parCh.addr, BNK1_IOCON_A	, 0xA0); //set mode IOCON bank to 8bit mode  See:Page-17 TABLE 3-4 at chip PDF
					//bbb();

					_processState = 2;

					// Turn On ALL pins at start
					if ((_parCh.startAllHIGH == true) && (_callerNode.lastState = -2)){
						if (log2consol) console.log("  MCP Now Setting ALL pins to HIGH. A+B = 1111111111111111");
						aBus.writeByteSync(_parCh.addr, BNK1_OLAT_A, 0xFF);	//Set output A to 11111111
						aBus.writeByteSync(_parCh.addr, BNK1_OLAT_B, 0xFF);	//Set output B to 11111111
						_parCh.AllStates 	= 0xFFFF;
						_parCh.startAllHIGH = false; // 1x running is enough. Turn it off now.
					}

					if (_parCh.AllStates = -1) {
						let ip1 = aBus.readByteSync(_parCh.addr, BNK1_GPIO_A);
						let ip2 = aBus.readByteSync(_parCh.addr, BNK1_GPIO_B);
						_parCh.lastTimeRed = performance.now();
						ip2 = (ip2 << 8);
						_parCh.AllStates = ip1 + ip2; // adding together with "or" = ip1 | ip2;
						if (log2consol) console.log("  MCP First READ OK. A="+ip1.toString(2)+" B="+ip2.toString(2)+" Allstates=" + _parCh.AllStates);
					}

					if (_isInput)		{_parCh.isInputs = _parCh.isInputs |  (1 << _bitNum) } 
					else				{_parCh.isInputs = _parCh.isInputs & ~(1 << _bitNum) };

					if (_bitNum < 8)	{aBus.writeByteSync(_parCh.addr, BNK1_IODIR_A,  _parCh.isInputs       & 0xFF);} //update in out mode A
					else				{aBus.writeByteSync(_parCh.addr, BNK1_IODIR_B, (_parCh.isInputs >> 8) & 0xFF);} //update in out mode B
					
					if (_isInput) {
						if (_pullUp)  { _parCh.pullUps  = _parCh.pullUps  | (1 << _bitNum) } else { _parCh.pullUps  = _parCh.pullUps  & ~(1 << _bitNum) };
	//					if (_invert)  { _parCh.inverts  = _parCh.inverts  | (1 << _bitNum) } else { _parCh.inverts  = _parCh.inverts  & ~(1 << _bitNum) };
						
						if (log2consol) console.log("  MCP Input pullups=" + _parCh.pullUps);
						if (_bitNum < 8)	{aBus.writeByteSync(_parCh.addr, BNK1_GPPU_A ,    _parCh.pullUps        & 0xFF);} //update input pull-up 100kQ resistor A
						else				{aBus.writeByteSync(_parCh.addr, BNK1_GPPU_B ,   (_parCh.pullUps  >> 8) & 0xFF);} //update input pull-up 100kQ resistor B
						aBus.writeByteSync(_parCh.addr, BNK1_IPOL_A, 0x00); //turn OFF input invert A
						aBus.writeByteSync(_parCh.addr, BNK1_IPOL_B, 0x00); //turn OFF input invert B
						if (_bitNum < 8)	{aBus.writeByteSync(_parCh.addr, BNK1_IPOL_A, 0x00);} //disable input invert A
						else				{aBus.writeByteSync(_parCh.addr, BNK1_IPOL_B, 0x00);} //disable input invert B
	//					if (_bitNum < 8)	{aBus.writeByteSync(_parCh.addr, IPOL_A,     _parCh.inverts        & 0xFF);} //update input invert A
	//					else				{aBus.writeByteSync(_parCh.addr, IPOL_B,    (_parCh.inverts  >> 8) & 0xFF);} //update input invert B
						if (_bitNum < 8)	{aBus.writeByteSync(_parCh.addr, BNK1_GPINTEN_A,  _parCh.isInputs       & 0xFF);} //update interrupts A
						else				{aBus.writeByteSync(_parCh.addr, BNK1_GPINTEN_B, (_parCh.isInputs >> 8) & 0xFF);} //update interrupts B
					}

				} // MCP chip

				_processState = 3;
				aBus.closeSync();
				aBus = null;

				if (log2consol) console.log("OK. MCP/PCF Bit-initialization finished. Bus closed.");
				_parCh.globalState = 1; // means: Working :)
				_callerNode.lastState = getBit( _parCh.AllStates, _bitNum );  // SET LAST STATE

				_parCh.RW_finish(); // release Read-Write blocking
				return true;
			}
			catch (err) {
				_parCh.RW_finish();
				if (_parCh.globalState < 60) _parCh.globalState += 2;  // The whole chip in error mode, because the Bus could not be opened
				_callerNode.lastState = -2;
				_callerNode.error( busStateTexts[_processState] + " failed. Bus=" + _parCh.busNum + " Pin=" + _bitNum + "\n  Error:" + err);
				showState( _callerNode, false, _parCh.globalState );
				aBus = null;
				return false;
			};
		}
		




// ********** TIMER ********** // ... for input
// *************************** //

		this.startChipTimer = function(_newInterval) {
			if (log2consol) console.log("  MCP/PCF startChipTimer = " + _newInterval +" ms");
			
			if ((_newInterval == undefined) || (_newInterval == 0)) {
				console.log("  MCP/PCF  Timer interval is UNDEFINED or 0 ! Timer will not be started. Exiting.");
				return null;
			}

			if (mainChipNode.chipTimer != null) { // timer is already running
				if (log2consol) console.log("  MCP/PCF Timer is already running");
				if (mainChipNode.interval == _newInterval) {
					if (log2consol) console.log("  MCP/PCF This timer interval is already set. There is nothing to do.");
					return null;
				} // nothing to do
				clearInterval(mainChipNode.chipTimer); // clear old, so a new can started
				mainChipNode.interval = _newInterval;
				mainChipNode.chipTimer = null;
				if (log2consol) console.log("  MCP/PCF Old timer destroyed.");
			}

		
			// STARTING a Timer in repeat mode
			if (log2consol) console.log("  MCP/PCF Starting Timer now...");				
			mainChipNode.chipTimer = setInterval(mainChipNode.myTimer, mainChipNode.interval );
		}

		// START the timer now ... >> moved this part to InputNode-creation
		//this.startChipTimer( this.interval ); // START, if any input nodes are available


		this.myTimer = function(read1x) {

			let   _processState = 0;
			const _addr = mainChipNode.addr;

			if (isNaN(mainChipNode.busNum))     {
				console.error("  MCP/PCF  chip myTimer busNum is undefined. Exiting.");
				mainChipNode.globalState += 2;
				return false;
			}
			if ( ! mainChipNode.RW_check() ) {
				console.error("  MCP/PCF myTimer is already running. Preventing to overlap > Exiting.");
				return false;
			} // prevent overlapping
			
			const _readTime	= performance.now(); // millisec. To change the Timer value, if a too short period is set.
			try {
				if (timerLog && log2consol) console.log("  MCP/PCF myTimer: opening bus...  Time: " + new Date( new Date().getTime() ).toISOString().slice(11, -1) );
	
				// this.on('error', function( i2cErr ) { timerErrorHandler(i2cErr) } ); // start async error handling

				let _aBus = i2cModule.openSync(mainChipNode.busNum);
				_processState = 1;
				let ipAll = 0;

				if (_addr >= 0x40) {
					if (timerLog && log2consol) console.log("  PCF8574 >> Now reading 8bit. Addr=" + _addr/2);
					ipAll = _aBus.receiveByteSync( Math.ceil( _addr / 2 ) );
					if (timerLog && log2consol) console.log("  MCP23017 Read success ipAll00=" + ipAll.toString(2));
				}
				else {
					if (timerLog && log2consol) console.log("  MCP23017 >> Now reading A+B banks... Typeof _aBUS:" + typeof(_aBus));
					let ipA = _aBus.readByteSync(_addr, BNK1_GPIO_A);
					let ipB = _aBus.readByteSync(_addr, BNK1_GPIO_B);
					ipAll = ipA + (ipB << 8);
					if (timerLog && log2consol) console.log("  MCP23017 Read success ipA00=" + ipA.toString(2) + "  ipB00=" + ipB.toString(2) + "   ipALL (dec)=" + ipAll);
				}
//				mainChipNode.lastTimeRed = performance.now();
				_processState = 3;
				_aBus.closeSync();

				if (mainChipNode.globalState != 1) {
					mainChipNode.globalState = 1; // successful read occured. No more "error state" or "uninitialised"
					if (mainChipNode.interval != mainChipNode.origInterv) { 
						if (timerLog && log2consol) console.log("  MCP/PCF Starting ChipTimer. Interval=" + mainChipNode.origInterv);
						mainChipNode.startChipTimer( mainChipNode.origInterv ); // this will delete the old timer and start normally again
					}
				}

				// *********  Now checking ALL the possible nodes, if any of these needs to be updated
				if (ipAll != mainChipNode.AllStates){
					let diffWord = ipAll ^ mainChipNode.AllStates;
					if (log2consol) console.log("!Change! of an i2c  MCP/PCF input. IP MASK0000=" + ipAll.toString(2) + "  Diff Mask0000=" + diffWord.toString(2));
					for (let i=0; i < mainChipNode.MaxBits; i++){	// (MaxBits= 8 or 16)
						if (diffWord & (1 << i)){
							const newState =  (((ipAll & (1 << i)) == 0) ? false : true); 
							if ( mainChipNode.ids[i] != null)  {
								const n = RED.nodes.getNode(mainChipNode.ids[i]);
								if (log2consol) console.log("  MCP/PCF  > ..searching for node i=" + i + "   id=" + mainChipNode.ids[i] + "  found node:" + n + "  glob_inp=" + mainChipNode.isInputs);
								if (n != null) { //&& (mainChipNode.isInputs & (1 << i)) > 0){ // check bit is used and is an input
									if (log2consol) console.log("  MCP/PCF  > Found a Node needs to be updated. Bit=" + i + " newState=" + newState + "   LastState=" + n.lastState);
									n.changed(newState, read1x);
								}
							}
						}
					}
					mainChipNode.AllStates = ipAll;
				}	
			}
			catch (err) {
				if (mainChipNode.globalState < 63) mainChipNode.globalState += 2;  // The whole chip in error mode, because the Bus could not be opened. Increasing next time-read to 2-4-6-..-60 sec.
				err.discription = busStateTexts[_processState] + " failed.";
				err.busNumber   = mainChipNode.busNum;
				err.address     = _addr;
				err.AllStates = mainChipNode.AllStates;
				console.error(err.discription + "  [Bus="+ mainChipNode.busNum +"]  [Addr=" + _addr + "]   [mainChipNode.AllStates=" + mainChipNode.AllStates + "]");
				mainChipNode.error(err);
				mainChipNode.RW_finish();
				try {
					// update ALL nodes, so they show "error"
					for (var i=0; i < mainChipNode.MaxBits; i++){ //(MaxBits= 8 or 16)
						if ( mainChipNode.ids[i] != null)  {
							const n = RED.nodes.getNode(mainChipNode.ids[i]);
							if (n != null) { 
								showState(n, -2, mainChipNode.globalState);
								//if (n.type == "MCP PCF In") n.changed(-2, true);
							}
						}
					}
					if ((_processState < 3) && !read1x)  { // if !read1x = called from debounce ... it should not restart
						mainChipNode.startChipTimer( mainChipNode.globalState * 1000 ); // re-try every 2-4-6-...60 sec.
					} 
				}
				catch (err){ 
					console.error(err);
				};
				return false;
			};

			mainChipNode.RW_finish();
			mainChipNode.lastTimeRed = performance.now(); //new Date().getTime();
			mainChipNode.readLength  = mainChipNode.lastTimeRed - _readTime;
			if (! read1x) {
				if (mainChipNode.interval < mainChipNode.readLength) {  // the time the reading took was too long. Increased the interval to double of that (ms).		
					mainChipNode.warning("  MCP/PCF Interval (" + mainChipNode.interval + "ms) is too short for input. Setting new time = " + (mainChipNode.readLength * 2).toString);
					mainChipNode.startChipTimer( mainChipNode.readLength * 2);
				} 
			}

			return true;
		}


		this.on('close', function() {  // stopping or deleting the Main-Chip-config
			try {
				if (mainChipNode.chipTimer) {
					if (log2consol) console.log("  MCP/PCF Closing ... Clearing myTimer.");
					clearInterval(mainChipNode.chipTimer);
					mainChipNode.chipTimer = null; 
				}
				
			}
			catch (err) { console.error( "  MCP/PCF Error while closing timer: " + err ); };
			try {
				global_i2c_bus_RW_ctx.set(_i2c_ctx_name, undefined); // clearing global context
			} catch {}
		});
	}

	// REGISTERING the main chip : 
	RED.nodes.registerType("mcp_pcf_chip", mcp_pcf_chipNode);



//INPUT SECTION
	function mcp_pcf_inNode(_inputConfig) {
		RED.nodes.createNode(this, _inputConfig);
		
		var node        = this;
		this.bitNum     = _inputConfig.bitNum;
		this.pullUp     = _inputConfig.pullUp;
		this.invert     = _inputConfig.invert;
		this.debounce   = _inputConfig.debounce;
		this.deB_timer  = null;
		this.onMsg 	    = _inputConfig.onMsg;
		this.offMsg     = _inputConfig.offMsg;
		this.lastState  = -2;
		this.initOK     = false;
		

		// check Master-Chip setup
		let _parentChipNode = RED.nodes.getNode(_inputConfig.chip);
		this.parentChip		= _parentChipNode;
		if (!_parentChipNode) {
			node.error("[MCP23017 + PCF8574] Master-global-Chip not found! Skipping in-node creation.");
			showState(node, true, 0);
			return null;
		}

		if (this.debounce > (_parentChipNode.interval - 20)) 	this.debounce = _parentChipNode.interval - 20; // 1 read needs 20ms >> so debounce should be that much shorter
		if (this.debounce < 0)  								this.debounce = 0;

		if (log2consol) console.log("---");		
		if (log2consol) console.log(">>> Initializing PCF8574 or MPC23017 Input node >>  bitNum=" + this.bitNum + "  pullUp=" + this.pullUp + "  invert=" + this.invert + "  id=" + this.id );

		this.initOK  = _parentChipNode.initializeBit   (this.bitNum, true, this.pullUp, node);
		showState(node, this.lastState, _parentChipNode.globalState); // shows uninit (yellow) or error (red) 

		this.deB_timer = null;

		this.on('close', function() {
			if (node.deB_timer != null){
				if (log2consol) console.log("  MCP/PCF  > clearing old Debounce Input timer...  [Bit=" + node.bitNum + "]");
				clearTimeout(node.deB_timer);
				node.deB_timer = null;
			}
		});

		this.updateState = function(_state, _msg) {
			if (node.lastState != _state) {
				if (log2consol) console.log(">> MCP/PCF Input State Changed=" + _state + "  [Bit=" + node.bitNum + "]  id=" + node.id);
				showState(node, _state, _parentChipNode.globalState); // will show inverted, if needed
				node.lastState  = _state;
			}
			if (_parentChipNode.globalState == 1){
				const nullmsg = (_msg == null);
				if (nullmsg) _msg = {};
				const _stateINV = node.invert ? !_state : _state;
				if (  _stateINV && node.onMsg ) _msg.payload = true;
				if (! _stateINV && node.offMsg) _msg.payload = false; 
				if (nullmsg && (_msg.payload != null)) {node.send( _msg )} else return _msg; // if called from "read_1x" input >> do not send yet
			}
		}

		this.changed = function( _state, _read1x ) {
			if (node.deB_timer != null){
				if (log2consol) console.log("  MCP/PCF > clearing old Debounce Input timer...  [Bit=" + node.bitNum + "]");
				clearTimeout(node.deB_timer);
				node.deB_timer = null;
			}
			if ( !_read1x && (node.debounce != 0) && (_parentChipNode.globalState == 1) && ( (_state == true) || (_state == false) ) ) { 
				// Start debounce re-checks the last state
				node.deB_state = _state;
				node.deB_timer = setTimeout(node.deBounceEnd, node.debounce, _state);
				if (log2consol) console.log("  MCP/PCF > New input Debounce timer set.  TimeEnd=" + node.debounce + "  State=" + _state);
			}
			else {
				node.updateState(_state, null);
				node.deB_state = _state;
			}
		}

		this.deBounceEnd = function(_state){
			node.deB_timer = null;
			if (_parentChipNode.globalState > 3) {
				if (log2consol) console.log("  MCP/PCF > Input timer Bounce CANCELED because chip is in Global-Error-State" );
				return false;
			}
			let _now = performance.now();
			if ((_now - node.lastTimeRed) < node.debounce * 1.2 ) {
				_state = getBit( _parentChipNode.AllStates, node.bitNum );
				node.updateState(_state, null);
			}
			else {
				let _read_success = _parentChipNode.myTimer(true); // forcing to re-read the current state from chip	
				if ( _read_success ){
					_state = getBit( _parentChipNode.AllStates, node.bitNum );
					if (log2consol) console.log("  MCP/PCF > Input timer Bounce Ended. [NewState=" + _state + "]   [Last State=" + node.lastState + "]  [Deb.state=" + node.deB_state +"]  [Bit=" + node.bitNum + "]  Ellapsed=" + (_now - node.lastTimeRed) + "ms" );
					if (_state == node.deB_state) node.updateState(_state, null);
				}
				else { node.deB_timer = setTimeout(node.deBounceEnd, node.debounce, _state); }
			}
		}

		this.on('input', function(msg, send, done) { // triggering an Immediate read if payload is True or 1 >> to support Interrupts
			if (msg.payload) {
				let _parCh = node.parentChip;
				if (log2consol) console.log("  MCP/PCF > Input Force-read triggered!  msg.payload=" + msg.payload );
				msg.immediateReadSuccess 	= _parCh.myTimer(true); // result is True, if succesfully red, false if any error occured during read
				msg.readingTimeLengthMs		= _parCh.readLength;
				msg.AllStatesRaw			= _parCh.AllStates;
				msg.AllBinary				= msg.immediateReadSuccess  ? _parCh.AllStates.toString(2) : "";
				msg = node.updateState( node.lastState, msg ); // << this will add (inverted) .payload
				if (log2consol) console.log("  MCP/PCF > Now sending msg.  msg.payload=" + msg.payload );
				node.send(msg);
				if (done) done();
			}
		});

		this.on('close', function() {  // stopping or deleting this node
			let _parCh = node.parentChip;
			try {
				for (let i=0; i < _parCh.MaxBits; i++){	//(MaxBits= 8 or 16)
					if ( _parCh.ids[i] == node.id)  {
						_parCh.ids[i] = null;
						break;
					}
				}
			}
			catch (err) { console.error( "  MCP/PCF Error while closing an In-Node: " + err ); };
		});

		if (this.initOK) { _parentChipNode.startChipTimer( _parentChipNode.interval ); }// START continuous read, if any input nodes are available
		else { }
	}

	RED.nodes.registerType("MCP PCF In", mcp_pcf_inNode);



//OUTPUT SECTION
	function mcp_pcf_outNode(_OutputConfig) {

		RED.nodes.createNode(this, _OutputConfig);

		var node 		  = this;
		node.bitNum       = _OutputConfig.bitNum;
		node.invert       = _OutputConfig.invert;
		node.lastState	  = -2;
		node.initOK       = false;


		let _parentChipNode = RED.nodes.getNode(_OutputConfig.chip); // this is not a visible node, but a hidden Chip-configuration one
		node.parentChip		= _parentChipNode;
		if (!_parentChipNode) {
			node.error("Master MCP23017 or PCF8574 Chip not set! Skipping node creation. Node.id=" + node.id);
			showState(node, -2, 2);
			return null;
		}
		node.startAllHIGH = _parentChipNode.startAllHIGH;
		
		if (log2consol) console.log("---");
		console.log(">>> Initializing  PCF8574 or MPC23017 Output node >>  invert=" + node.invert + " bitNum=" + node.bitNum + "  ID=" + node.id);

		this.initOK  = _parentChipNode.initializeBit(node.bitNum, false, false, node);
		showState(node, this.lastState, _parentChipNode.globalState); // shows uninit (yellow) or error (red)


		this.changed = function( _state, _read1x ) {
			showState(node, _state, _parentChipNode.globalState); // will show inverted, if needed
			node.lastState = _state;
		}

		this.setOutput = function(_bitNum, _newState, _callerNode){
			let _processState = 0;
			if ( ! _callerNode) {      consol.error("  MCP PCF setOutpup >> _callerNode=null !"); return false; }
			let _parCh = _callerNode.parentChip;
			if ( ! _parCh)		{ _callerNode.error("  MCP PCF setOutpup >> _callerNode.parentChip=null !"); return false; }
			const _addr = _parCh.addr;
			if ( ! _addr)		{ _callerNode.error("  MCP PCF setOutpup >> parentChip.addr=null !"); return false; }

			if ( ! _parCh.RW_check() ) return false; // checks, if there is any 

			try {
				let ip8  = -1;
				let ip16 = -1; 
				if (log2consol) console.log("  MCP/PCF setOutput "+ _callerNode.id +"  > Addr=" + _addr + "  BitNum=" + _bitNum + " _newState:" + _newState +" > opening bus...");
				let _aBus = i2cModule.openSync(_parCh.busNum);
				_processState = 1;

				// Set ALL pins to 0000000000000000 or 1111111111111111
				if (_bitNum == -1) {
					let OnOff = _newState ? 0xFF : 0x00;
					if (_addr >= 0x40) { // This is a PCF 8bit chip
						_aBus.sendByteSync (Math.ceil( _addr / 2 ), OnOff & 0xFF);
						_parCh.lastTimeRed = performance.now();
						if (log2consol) console.log("  PCF 8bit chip ALL set to=" + OnOff);
						_parCh.AllStates = OnOff;
					}
					else { // MCP chip
						_aBus.writeByteSync(_addr, BNK1_OLAT_A, OnOff & 0xFF);	//Set output A
						_aBus.writeByteSync(_addr, BNK1_OLAT_B, OnOff & 0xFF);	//Set output B
						_parCh.lastTimeRed = performance.now();
						if (log2consol) console.log("  MPC 16bit chip ALL set to=" + OnOff);
						_parCh.AllStates = _newState ? 0xFFFF : 0x00;
					}
					for (let i=0; i < _parCh.MaxBits; i++){	//(MaxBits= 8 or 16)
						if ( _parCh.ids[i] != null)  {
							const n = RED.nodes.getNode(_parCh.ids[i]);
							if (n != null) {
								showState( n , _newState, _parCh.globalState);
								n.lastState = _newState; 
							}
						}
					}					
				}
				// Set one pin only to: 0 or 1
				else {
					// first it reads the current state of pins of 1 bank (A or B) (takes 4ms)
					if (_bitNum < 8) {
						if (_addr >= 0x40)	ip8 = _aBus.receiveByteSync(Math.ceil( _addr / 2 ));			// PCF chip
						else				ip8 = _aBus.readByteSync(_addr, BNK1_GPIO_A);
						ip16 = ip8;
					} else {
						ip8 = _aBus.readByteSync(_addr, BNK1_GPIO_B);
						ip16 = (ip8 << 8); // make it 16 bit
					}
					_parCh.lastTimeRed = performance.now();
					if (log2consol) console.log("  Read before write success ip8="+ ip8 + "  ip16="+ ip16 );

					ip16 = updateBit(ip16, _bitNum, _newState); //16 bit
					if (log2consol) console.log("  Updated bit ip16="+ ip16 );
					//if (_newState)	{ip1 = ip1 |   1 << _bitNum ;} 
					//else				{ip1 = ip1 & ~(1 << _bitNum);}

					_processState = 2;
					if (_addr >= 0x40)		 _aBus.sendByteSync(Math.ceil( _addr / 2 ), ip16 & 0xFF);		// PCF chip
					else {
						if (_bitNum < 8)	{_aBus.writeByteSync(_addr, BNK1_OLAT_A,  ip16       & 0xFF);}	//Set output A
						else				{_aBus.writeByteSync(_addr, BNK1_OLAT_B, (ip16 >> 8) & 0xFF);}	//Set output B
					}
				}

				_processState = 3;
				_aBus.closeSync();
				_aBus = null;
				_parCh.globalState = 1; // working

				let n = _callerNode;
				if ( n.bitNum != _bitNum ) 	n = _parCh.ids[_bitNum]; // if the function was called with a "direct-msg-control-method" change the right node if exists
				if (n != null) 	showState(n, _newState, 1);
				
				if (log2consol) console.log(":-)  MCP/PCF setOutput finished. Closing bus. ip1="+ ip16 );
				_parCh.RW_finish();
				return true;
			}
			catch (err) {
				if (_parCh.globalState < 60) _parCh.globalState += 2;  // The whole chip in error mode, because the Bus could not be opened
				_callerNode.lastState = -2;
				showState(_callerNode, -2, 2);
				let _ee = busStateTexts[_processState] + " failed. Bus="+ _parCh.busNum +" Addr=" + _addr + " Pin="+_bitNum + " NewState=" + _newState;
				console.error(_ee + " " + err);
				_callerNode.error([_ee, err]);
				_aBus = null;
				_parCh.RW_finish();
				return false;
			};
		}


		this.on('input', function(msg) {
			let _parCh = node.parentChip;
			if (!node.initOK) {
				if (log2consol) console.log("  MCP/PCF Out > New msg recieved, but Node not initialized yet. ID=" + node.id + "  bitNum=" + node.bitNum);
				node.initOK = _parCh.initializeBit(node.bitNum, false, false, this.id);
				if (!node.initOK) {return null;}
			}

			if (! _parCh) { consol.error("  MCP PCF Out >> input msg recieved, but ParentChip of Node is null!"); return null }

			// ***  SET only 1 pin via msg JSON  *** //
			if ( msg.payload == -1 ) {
				if (log2consol) console.log("  MCP/PCF > Set direct pin Chip Addr=" + _parCh.addr);
				const _Pin1 = parseInt( msg.pin );
				if ((_Pin1 == NaN) || (_Pin1 < 0) || (_Pin1 > 15) ) {
					node.error("msg.pin not properly set for direct control of a MCP or PCF chip. It must be a number between 0-7 or 8-15");
					return false;
				}
				if (msg.state == null) {
					node.error("msg.state not set for direct control of a MCP or PCF chip.");
					return false;
				}
				const _OnOff1 = (msg.state == true) || (msg.state == 1); //safe boolean conversion
				node.setOutput(_Pin1, _OnOff1, node);
			} else

			if ( msg.payload == "All0" ) {
				if (log2consol) console.log("  MCP/PCF > Set ALL pins to 0000...  Chip Addr=" + _parCh.addr);
				node.setOutput(-1, false, node);
			} else
			if ( msg.payload == "All1" ) {
				if (log2consol) console.log("  MCP/PCF > Set ALL pins to 1111...  Chip Addr=" + _parCh.addr);
				node.setOutput(-1, true, node);
			} else
			
			{
				//console.log("OUT: NEW input... payl=" + msg.payload);
				let _pinOn = (msg.payload == true) || (msg.payload == 1); //safe boolean conversion
				let _invPinOn = node.invert ? !_pinOn : _pinOn;

				if (node.setOutput(node.bitNum, _invPinOn, node)) {
					showState(node, _invPinOn, _parCh.globalState);
					node.lastState = _invPinOn;
				}
			}			
		}) ;
		
		this.on('close', function() {  // stopping or deleting this node
			let _parCh = node.parentChip;
			try {
				for (let i=0; i < _parCh.MaxBits; i++){	//(MaxBits= 8 or 16)
					if ( _parCh.ids[i] == node.id)  {
						_parCh.ids[i] = null;
						break;
					}
				}
			}
			catch (err) { console.error( "  MCP/PCF Error while closing an In-Node: " + err ); };
		});

	}
	
	RED.nodes.registerType("MCP PCF Out", mcp_pcf_outNode);
}
