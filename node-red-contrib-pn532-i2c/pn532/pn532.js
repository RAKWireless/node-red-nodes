// Description: This module will let you communicate with a PN532 RFID/NFC shield or breakout
// License: MIT
// Author: rakwireless.com
// Version: 0.0.1

// import time
// from digitalio import Direction

const _PREAMBLE = 0x00
const _STARTCODE1 = 0x00
const _STARTCODE2 = 0xFF
const _POSTAMBLE = 0x00

const _HOSTTOPN532 = 0xD4
const _PN532TOHOST = 0xD5

// PN532 Commands
const _COMMAND_DIAGNOSE = 0x00
const _COMMAND_GETFIRMWAREVERSION = 0x02
const _COMMAND_GETGENERALSTATUS = 0x04
const _COMMAND_READREGISTER = 0x06
const _COMMAND_WRITEREGISTER = 0x08
const _COMMAND_READGPIO = 0x0C
const _COMMAND_WRITEGPIO = 0x0E
const _COMMAND_SETSERIALBAUDRATE = 0x10
const _COMMAND_SETPARAMETERS = 0x12
const _COMMAND_SAMCONFIGURATION = 0x14
const _COMMAND_POWERDOWN = 0x16
const _COMMAND_RFCONFIGURATION = 0x32
const _COMMAND_RFREGULATIONTEST = 0x58
const _COMMAND_INJUMPFORDEP = 0x56
const _COMMAND_INJUMPFORPSL = 0x46
const _COMMAND_INLISTPASSIVETARGET = 0x4A
const _COMMAND_INATR = 0x50
const _COMMAND_INPSL = 0x4E
const _COMMAND_INDATAEXCHANGE = 0x40
const _COMMAND_INCOMMUNICATETHRU = 0x42
const _COMMAND_INDESELECT = 0x44
const _COMMAND_INRELEASE = 0x52
const _COMMAND_INSELECT = 0x54
const _COMMAND_INAUTOPOLL = 0x60
const _COMMAND_TGINITASTARGET = 0x8C
const _COMMAND_TGSETGENERALBYTES = 0x92
const _COMMAND_TGGETDATA = 0x86
const _COMMAND_TGSETDATA = 0x8E
const _COMMAND_TGSETMETADATA = 0x94
const _COMMAND_TGGETINITIATORCOMMAND = 0x88
const _COMMAND_TGRESPONSETOINITIATOR = 0x90
const _COMMAND_TGGETTARGETSTATUS = 0x8A

const _RESPONSE_INDATAEXCHANGE = 0x41
const _RESPONSE_INLISTPASSIVETARGET = 0x4B

const _WAKEUP = 0x55

const _MIFARE_ISO14443A = 0x00

// Mifare Commands
const MIFARE_CMD_AUTH_A = 0x60
const MIFARE_CMD_AUTH_B = 0x61
const MIFARE_CMD_READ = 0x30
const MIFARE_CMD_WRITE = 0xA0
const MIFARE_CMD_TRANSFER = 0xB0
const MIFARE_CMD_DECREMENT = 0xC0
const MIFARE_CMD_INCREMENT = 0xC1
const MIFARE_CMD_STORE = 0xC2
const MIFARE_ULTRALIGHT_CMD_WRITE = 0xA2

// Prefixes for NDEF Records (to identify record type)
const NDEF_URIPREFIX_NONE = 0x00
const NDEF_URIPREFIX_HTTP_WWWDOT = 0x01
const NDEF_URIPREFIX_HTTPS_WWWDOT = 0x02
const NDEF_URIPREFIX_HTTP = 0x03
const NDEF_URIPREFIX_HTTPS = 0x04
const NDEF_URIPREFIX_TEL = 0x05
const NDEF_URIPREFIX_MAILTO = 0x06
const NDEF_URIPREFIX_FTP_ANONAT = 0x07
const NDEF_URIPREFIX_FTP_FTPDOT = 0x08
const NDEF_URIPREFIX_FTPS = 0x09
const NDEF_URIPREFIX_SFTP = 0x0A
const NDEF_URIPREFIX_SMB = 0x0B
const NDEF_URIPREFIX_NFS = 0x0C
const NDEF_URIPREFIX_FTP = 0x0D
const NDEF_URIPREFIX_DAV = 0x0E
const NDEF_URIPREFIX_NEWS = 0x0F
const NDEF_URIPREFIX_TELNET = 0x10
const NDEF_URIPREFIX_IMAP = 0x11
const NDEF_URIPREFIX_RTSP = 0x12
const NDEF_URIPREFIX_URN = 0x13
const NDEF_URIPREFIX_POP = 0x14
const NDEF_URIPREFIX_SIP = 0x15
const NDEF_URIPREFIX_SIPS = 0x16
const NDEF_URIPREFIX_TFTP = 0x17
const NDEF_URIPREFIX_BTSPP = 0x18
const NDEF_URIPREFIX_BTL2CAP = 0x19
const NDEF_URIPREFIX_BTGOEP = 0x1A
const NDEF_URIPREFIX_TCPOBEX = 0x1B
const NDEF_URIPREFIX_IRDAOBEX = 0x1C
const NDEF_URIPREFIX_FILE = 0x1D
const NDEF_URIPREFIX_URN_EPC_ID = 0x1E
const NDEF_URIPREFIX_URN_EPC_TAG = 0x1F
const NDEF_URIPREFIX_URN_EPC_PAT = 0x20
const NDEF_URIPREFIX_URN_EPC_RAW = 0x21
const NDEF_URIPREFIX_URN_EPC = 0x22
const NDEF_URIPREFIX_URN_NFC = 0x23

const _GPIO_VALIDATIONBIT = 0x80
const _GPIO_P30 = 0
const _GPIO_P31 = 1
const _GPIO_P32 = 2
const _GPIO_P33 = 3
const _GPIO_P34 = 4
const _GPIO_P35 = 5

const _ACK = [0x00, 0x00, 0xFF, 0x00, 0xFF, 0x00];
const _FRAME_START = [0x00, 0x00, 0xFF];

// class BusyError(Exception) {
//     // Base class for exceptions in this module
// }

/* PN532 driver base, must be extended for I2C/SPI/UART interfacing */
module.exports = class PN532 {
    constructor(debug, irq_pin, reset_pin) {
        /* Create an instance of the PN532 class */
        let self = this;
        self.low_power = true;
        if (!debug) {
            debug = false;
        }
        self.debug = debug
        if (!irq_pin) {
            irq_pin = -1;
        }
        self._irq = irq_pin;
        if (!reset_pin) {
            reset_pin = -1;
        }
        self._reset_pin = reset_pin;
    }

    _read_data(count) {
        // Read raw data from device, not including status bytes:
        // Subclasses MUST implement this!
        throw new Error('Subclasses MUST implement this!');
    }

    _write_data(framebytes) {
        // Write raw bytestring data to device, not including status bytes:
        // Subclasses MUST implement this!
        throw new Error('Subclasses MUST implement this!');
    }

    _wait_ready(timeout) {
        // Check if busy up to max length of 'timeout' seconds
        // Subclasses MUST implement this!
        throw new Error('Subclasses MUST implement this!');
    }

    _wakeup() {
        // Send special command to wake up
        throw new Error('Subclasses MUST implement this!');
    }

    delay_ms(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if (new Date().getTime() - start > milliseconds) {
                break;
            }
        }
    }

    reset() {
        /* Perform a hardware reset toggle and then wake up the PN532 */
        // let self = this;
        // if (self._reset_pin) {
        //     if (self.debug)
        //         print("Resetting")
        //     self._reset_pin.value = false
        //     self.delay_ms(40)
        //     self._reset_pin.value = true
        //     self.delay_ms(10)
        // }
        self._wakeup()
    }

    _write_frame(data) {
        let self = this;
        /* Write a frame to the PN532 with the specified data bytearray. */
        if (data && data.length && data.length >= 255 || data.length <= 1) {
            throw new Error("Data must be array of 1 to 255 bytes.");
        }
        // Build frame to send as:
        // - Preamble (0x00)
        // - Start code  (0x00, 0xFF)
        // - Command length (1 byte)
        // - Command length checksum
        // - Command bytes
        // - Checksum
        // - Postamble (0x00)
        let frame = Buffer.alloc(5);
        frame[0] = _PREAMBLE;
        frame[1] = _STARTCODE1;
        frame[2] = _STARTCODE2;
        let length = data.length;
        frame[3] = length & 0xFF;
        frame[4] = (~length + 1) & 0xFF;

        frame = Buffer.concat([frame, data]);

        let checksum = 0;
        for (let i = 0; i < length; i++) {
            checksum += data[i];
        }

        let tail = Buffer.alloc(2);
        tail[0] = ~checksum + 1;
        tail[1] = _POSTAMBLE;

        frame = Buffer.concat([frame, tail]);

        // if (self.debug)
        //     print("Write frame: ", [hex(i) for i in frame])

        // Send frame.
        self._write_data(frame)
    }

    _read_frame(length) {
        /* Read a response frame from the PN532 of at most length bytes in size.
        Returns the data inside the frame if found, otherwise raises an exception
        if there is an error parsing the frame.  Note that less than length bytes
        might be returned!
         */
        let self = this;
        // Read frame with expected length of data.
        let response = self._read_data(length + 7);
        // if (self.debug)
        //     print("Read frame:", [hex(i) for i in response])

        // Swallow all the 0x00 values that preceed 0xFF.
        let offset = 0
        while (response[offset] == 0x00) {
            offset += 1;
            if (offset >= response.length)
                throw new Error("Response frame preamble does not contain 0x00FF!");
        }

        if (response[offset] != 0xFF)
            throw new Error("Response frame preamble does not contain 0x00FF!");
        offset += 1
        if (offset >= response.length)
            throw new Error("Response contains no data!");

        //Check length & length checksum match.
        let frame_len = response[offset];
        if ((frame_len + response[offset + 1]) & 0xFF != 0)
            throw new Error("Response length checksum did not match length!");

        // Check frame checksum value matches bytes.
        let checksum = 0;
        for (let i = 0; i < frame_len + 1; i++) {
            checksum += response[offset + 2 + i];
        }
        checksum = checksum & 0xFF;
        if (checksum != 0)
            throw new Error(
                "Response checksum did not match expected value: ", checksum
            )

        // Return frame data.
        return response.slice(offset + 2, offset + 2 + frame_len);
    }

    call_function(command, response_length, params, timeout) {
        /* Send specified command to the PN532 and expect up to response_length
        bytes back in a response.  Note that less than the expected bytes might
        be returned!  Params can optionally specify an array of bytes to send as
        parameters to the function call.  Will wait up to timeout seconds
        for a response and return a bytearray of response bytes, or None if no
        response is available within the timeout.
         */
        let self = this;
        if (!response_length) {
            response_length = 0;
        }
        if (!params) {
            params = [];
        }
        if (!timeout) {
            timeout = 1;
        }

        if (!self.send_command(command, params, timeout)) {
            return null;
        }

        return self.process_response(command, response_length, timeout)
    }

    send_command(command, params, timeout) {
        /* Send specified command to the PN532 and wait for an acknowledgment.
        Will wait up to timeout seconds for the acknowlegment and return true.
        If no acknowlegment is received, False is returned.
         */
        let self = this;
        if (self.low_power)
            self._wakeup()

        // Build frame data with command and parameters.
        let data = Buffer.alloc(2 + params.length);
        data[0] = _HOSTTOPN532;
        data[1] = command & 0xFF;

        for (let i = 0; i < params.length; i++) {
            data[2 + i] = params[i];
        }

        // Send frame and wait for response.
        try {
            self._write_frame(data);
        } catch (e) {
            return false;
        }

        if (!self._wait_ready(timeout)) {
            return false;
        }

        // Verify ACK response and wait to be ready for function response.
        let ret = self._read_data(_ACK.length);
        if (ret.compare(new Buffer.from(_ACK)) != 0) {
            throw new Error("Did not receive expected ACK from PN532!");
        }

        return true;
    }

    process_response(command, response_length, timeout) {
        /* Process the response from the PN532 and expect up to response_length
        bytes back in a response.  Note that less than the expected bytes might
        be returned! Will wait up to timeout seconds for a response and return
        a bytearray of response bytes, or None if no response is available
        within the timeout.
         */
        let self = this;
        if (!self._wait_ready(timeout))
            return null;

        if (!timeout) {
            timeout = 1;
        }

        if (!response_length) {
            response_length = 0;
        }
        // Read response bytes.
        let response = self._read_frame(response_length + 2);

        // Check that response is for the called function.
        if (!(response[0] == _PN532TOHOST && response[1] == (command + 1)))
            throw new Error("Received unexpected command response!")

        // Return response data.
        return response.slice(2);
    }

    power_down() {
        /* Put the PN532 into a low power state. If the reset pin is connected a
        hard power down is performed, if not, a soft power down is performed
        instead. Returns true if the PN532 was powered down successfully or
        False if not. */
        let self = this;
        if (self._reset_pin) {  // Hard Power Down if the reset pin is connected
            self._reset_pin.value = false;
            self.low_power = true;
        } else {
            // Soft Power Down otherwise. Enable wakeup on I2C, SPI, UART
            response = self.call_function(_COMMAND_POWERDOWN, 0, [0xB0, 0x00], 1)
            self.low_power = (response[0] == 0x00);
        }

        self.delay_ms(5);
        return self.low_power;
    }

    firmware_version() {
        /* Call PN532 GetFirmwareVersion function and return a tuple with the IC,
        Ver, Rev, and Support values.
         */
        let self = this;
        let response = self.call_function(_COMMAND_GETFIRMWAREVERSION, 4, [], 0.5);
        if (!response)
            throw new Error("timeout");
        return response;
    }

    SAM_configuration() {
        /* Configure the PN532 to read MiFare cards. */
        // Send SAM configuration command with configuration for:
        //  - 0x01, normal mode
        //  - 0x14, timeout 50ms * 20 = 1 second
        //  - 0x01, use IRQ pin
        let self = this;
        // Note that no other verification is necessary as call_function will
        // check the command was executed as expected.
        self.call_function(_COMMAND_SAMCONFIGURATION, 0, [0x01, 0x14, 0x01], 1);
    }

    read_passive_target(card_baud, timeout) {
        /* Wait for a MiFare card to be available and return its UID when found.
        Will wait up to timeout seconds and return null if no card is found,
        otherwise a bytearray with the UID of the found card is returned.
         */
        let self = this;
        if (!card_baud) {
            card_baud = _MIFARE_ISO14443A;
        }
        if (!timeout) {
            timeout = 1;
        }
        // Send passive read command for 1 card.  Expect at most a 7 byte UUID.
        let response = self.listen_for_passive_target(card_baud, timeout)
        // If no response is available return null to indicate no card is present.
        if (!response)
            return null
        return self.get_passive_target(timeout)
    }

    listen_for_passive_target(card_baud, timeout) {
        /* Send command to PN532 to begin listening for a Mifare card. This
        returns true if the command was received succesfully. Note, this does
        not also return the UID of a card! `get_passive_target` must be called
        to read the UID when a card is found. If just looking to see if a card
        is currently present use `read_passive_target` instead.
         */
        let self = this;
        if (!card_baud) {
            card_baud = _MIFARE_ISO14443A;
        }
        if (!timeout) {
            timeout = 1;
        }
        // Send passive read command for 1 card.  Expect at most a 7 byte UUID.
        let response;
        try {
            response = self.send_command(_COMMAND_INLISTPASSIVETARGET, [0x01, card_baud], timeout)
        } catch (e) {
            return false;  // _COMMAND_INLISTPASSIVETARGET failed
        }
        return response;
    }

    get_passive_target(timeout) {
        /* Will wait up to timeout seconds and return null if no card is found,
        otherwise a bytearray with the UID of the found card is returned.
        `listen_for_passive_target` must have been called first in order to put
        the PN532 into a listening mode.

        It can be useful to use this when using the IRQ pin. Use the IRQ pin to
        detect when a card is present and then call this function to read the
        card's UID. This reduces the amount of time spend checking for a card.
         */
        let self = this;
        if (!timeout) {
            timeout = 1;
        }
        let response = self.process_response(_COMMAND_INLISTPASSIVETARGET, 30, timeout);
        // If no response is available return null to indicate no card is present.
        if (!response)
            return null;
        // Check only 1 card with up to a 7 byte UID is present.
        if (response[0] != 0x01)
            throw new Error("More than one card detected!")
        if (response[5] > 7)
            throw new Error("Found card with unexpectedly long UID!")
        // Return UID of card.
        return response.slice(6, 6 + response[5]);
    }

    mifare_classic_authenticate_block(uid, block_number, key_number, key) {
        /* Authenticate specified block number for a MiFare classic card.  Uid
        should be a byte array with the UID of the card, block number should be
        the block to authenticate, key number should be the key type (like
        MIFARE_CMD_AUTH_A or MIFARE_CMD_AUTH_B), and key should be a byte array
        with the key data.  Returns true if the block was authenticated, or False
        if not authenticated.
         */
        let self = this;
        // Build parameters for InDataExchange command to authenticate MiFare card.
        let params = [];
        params[0] = 0x01;  // Max card numbers
        params[1] = key_number & 0xFF;
        params[2] = block_number & 0xFF;
        for (var i = 0; i < key.length; i++) {
            params.push(key[i]);
        }
        for (var i = 0; i < uid.length; i++) {
            params.push(uid[i]);
        }
        //a = a.concat(params, key);
        //b = b.concat(a, uid);
        console.log(params);
        // Send InDataExchange request and verify response is 0x00.
        let response = self.call_function(
            _COMMAND_INDATAEXCHANGE, 1, params, 1
        );
        return (response[0] == 0x00);
    }

    mifare_classic_read_block(block_number) {
        /* Read a block of data from the card.  Block number should be the block
        to read.  If the block is successfully read a bytearray of length 16 with
        data starting at the specified block will be returned.  If the block is
        not read then None will be returned.
         */
        let self = this;
        // Send InDataExchange request to read block of MiFare data.
        let response = self.call_function(
            _COMMAND_INDATAEXCHANGE, 17, [0x01, MIFARE_CMD_READ, block_number & 0xFF], 1
        );

        // Check first response is 0x00 to show success.
        if (response[0] != 0x00)
            return null;
        // Return first 4 bytes since 16 bytes are always returned.
        return response.slice(1);
    }

    mifare_classic_write_block(block_number, data) {
        /* Write a block of data to the card.  Block number should be the block
        to write and data should be a byte array of length 16 with the data to
        write.  If the data is successfully written then true is returned,
        otherwise False is returned.
        */
        let self = this;
        if (!data || data.length != 16) {
            throw new Error("Data must be an array of 16 bytes!");
        }

        // Build parameters for InDataExchange command to do MiFare classic write.
        let params = [];
        params[0] = 0x01;  // Max card numbers
        params[1] = MIFARE_CMD_WRITE;
        params[2] = block_number & 0xFF;
        for (var i = 0; i < data.length; i++) {
            params.push(data[i]);
        }

        // Send InDataExchange request.
        let response = self.call_function(_COMMAND_INDATAEXCHANGE, 1, params);

        return (response[0] == 0x0);
    }

    ntag2xx_write_block(block_number, data) {
        /* Write a block of data to the card.  Block number should be the block
        to write and data should be a byte array of length 4 with the data to
        write.  If the data is successfully written then true is returned,
        otherwise False is returned.
         */
        let self = this;
        if (!data || data.length != 4) {
            throw new Error("Data must be an array of 4 bytes!");
        }

        // Build parameters for InDataExchange command to do NTAG203 classic write.
        let params = bytearray(3);
        params[0] = 0x01;  // Max card numbers
        params[1] = MIFARE_ULTRALIGHT_CMD_WRITE;
        params[2] = block_number & 0xFF;
        params = Buffer.concat(params, data);

        // Send InDataExchange request.
        let response = self.call_function(
            _COMMAND_INDATAEXCHANGE, 1, params, 1
        )
        return (response[0] == 0x00);
    }

    ntag2xx_read_block(block_number) {
        /* Read a block of data from the card.  Block number should be the block
        to read.  If the block is successfully read the first 4 bytes (after the
        leading 0x00 byte) will be returned.
        If the block is not read then None will be returned.
         */
        let self = this;
        let ntag2xx_block = self.mifare_classic_read_block(block_number);
        if (ntag2xx_block != None)
            return ntag2xx_block.slie(0, 4);  // only 4 bytes per page

        return null;
    }
}
