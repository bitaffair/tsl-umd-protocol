'use strict';

const compose$2 = data => {

  // clone values
  data = Object.assign({}, data);

  // set limits
  data.brightness = Math.max(0, Math.min(3, data.brightness || 0));
  data.address = Math.max(0, Math.min(127, data.address || 0));

  // sanitize boolean values
  data.t1 = !!data.t1 ? 1 : 0;
  data.t2 = !!data.t2 ? 1 : 0;
  data.t3 = !!data.t3 ? 1 : 0;
  data.t4 = !!data.t4 ? 1 : 0;


  const HEADER = 0x80 + data.address;

  let CTRL = 0x00;

  // set MSB of brightness
  CTRL |= (data.brightness & 0b10) << 4; // same as >> 1 << 5

  // set LSB of brightness
  CTRL |= (data.brightness & 0b01) << 4; // same as >> 0 << 4

  // Set tally
  CTRL |= data.t1 << 3;
  CTRL |= data.t2 << 2;
  CTRL |= data.t3 << 1;
  CTRL |= data.t4 << 0;

  const DATA = Buffer.from(data.label.padEnd(16, '\0'));

  return Buffer.concat([
    Buffer.from([
      HEADER,
      CTRL
    ]),
    DATA
  ]);
};

const parse$2 = buf => {

  const HEADER = buf[0];
  const CTRL = buf[1];
  const DATA = buf.subarray(2);

  const type = (CTRL & (1 << 6)) >> 6;

  // display data
  if (type === 0) {

    const address = HEADER - 0x80;
    const brightness = (CTRL >> 4) & 0b11;
    const t1 = (CTRL >> 3) & 1;
    const t2 = (CTRL >> 2) & 1;
    const t3 = (CTRL >> 1) & 1;
    const t4 = (CTRL >> 0) & 1;
    const label = DATA.subarray(0, DATA.indexOf('\0')).toString();

    return {
      address,
      brightness,
      label,
      t1,
      t2,
      t3,
      t4,
    }
  }

  // command data
  else if (data.type === 1) {
    throw new Error('Command data not implemented yet');
  }

};

var index$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  compose: compose$2,
  parse: parse$2
});

/**
 * Calculate checksum as 2’s complement of (sum of all V3.1 bytes)) modulo 128
 * @param {Buffer} buf 
 * @returns number
 */
function checksum(buf) {
  const sum = buf.reduce((a, b) => a + b, 0);
  const complement_1 = ~sum;
  const complement_2 = (complement_1 + 1) & 0xFF;
  return complement_2 % 128;
}

const XDATA40_parseDisplay = byte => {

  // bit 7
  if (((byte >> 7) & 1) !== 0) {
    throw new Error('Expected bit 7 of XDATA-display to be zero');
  }

  // ignore bit 6

  // bit 5+4
  const LH = (byte >> 4) & 0b11;

  // bit 2+3
  const TXT = (byte >> 2) & 0b11;

  // bit 0+1
  const RH = byte & 0b11;

  return {
    LH,
    TXT,
    RH
  }
};





const XDATA40_parse = buf => {

  if (buf.length !== 2) {
    throw new Error('Expected XDATA to contain two bytes');
  }

  return {
    displayL: XDATA40_parseDisplay(buf[0]),
    displayR: XDATA40_parseDisplay(buf[1]),
  }
};


const _sanitizeDisplayAttr = val => {
  return Math.max(0, Math.min(val || 0, 3))
};

const XDATA40_composeDisplay = obj => {
  let byte = 0;

  const bit2mask = 0b11;

  byte |= (_sanitizeDisplayAttr(obj.LH) & bit2mask) << 4;
  byte |= (_sanitizeDisplayAttr(obj.TXT) || 0 & bit2mask) << 2;
  byte |= (_sanitizeDisplayAttr(obj.RH) || 0 & bit2mask);

  return byte;
};




const XDATA40_compose = data => {
  return Buffer.from([
    XDATA40_composeDisplay(data.displayL || {}),
    XDATA40_composeDisplay(data.displayR || {}),
  ]);
};

const compose$1 = (obj) => {

  let buf = compose$2(obj);


  const CHKSUM = checksum(buf);

  let VBC = 0;
  VBC = VBC | (2 & 0b111);

  const XDATA = XDATA40_compose(obj);

  return Buffer.concat([
    buf,
    Buffer.from([
      CHKSUM,
      VBC
    ]),
    XDATA
  ]);
};

const parse$1 = (buf) => {

  const objV31 = parse$2(buf);

  const obj = {
    brightness: objV31.brightness,
    address: objV31.address,
    label: objV31.label
  };

  // CHKSUM
  const CHKSUM = buf[18];

  if (CHKSUM !== checksum(buf.subarray(0, 18))) {
    throw new Error('Checksum missmatch');
  }


  // VBC
  const VBC = buf[19];

  if ((VBC >> 7) & 1 !== 0) {
    throw new Error('Expected bit 7 of VBC to be 0');
  }

  const minVersion = (VBC >> 4) & 0b111;
  obj.version = `4.${minVersion}`;

  // XDATA
  const XDATAByteCount = VBC & 0b111;

  if (minVersion === 0) {
    const xdataParsed = XDATA40_parse(buf.subarray(20, 20 + XDATAByteCount));
    Object.assign(obj, xdataParsed);
  } else {
    throw new Error(`Version not implemented: V4.${minVersion}`);
  }

  return obj;
};

var index$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  compose: compose$1,
  parse: parse$1
});

/**
 * Compose display message to buffer
 * Message definition: INDEX(16) / CONTROL(8) / (LENGTH(16) / TEXT)
 * @param {Object} obj 
 */
const composeDMSG = (obj, options) => {

  const brightness = Math.max(0, Math.min(obj.brightness || 0, 3));
  const RH = Math.max(0, Math.min(obj.RH || 0, 3));
  const LH = Math.max(0, Math.min(obj.LH || 0, 3));
  const TXT = Math.max(0, Math.min(obj.TXT || 0, 3));

  const HEADER = Buffer.alloc(6, 0);

  // INDEX
  HEADER.writeUInt16LE(obj.index, 0);

  // CONTROL
  let CONTROL = 0;

  CONTROL |= (RH & 0b11);
  CONTROL |= (TXT & 0b11) << 2;
  CONTROL |= (LH & 0b11) << 4;
  CONTROL |= (brightness & 0b11) << 6;

  HEADER.writeUInt16LE(CONTROL, 2);


  // Display data
  const label = (typeof obj.label === 'string' || obj.label instanceof String) ? obj.label : '';

  // TEXT
  const TEXT = Buffer.from(label, options?.UNICODE ? 'utf16le' : 'ascii');

  // LENGTH
  HEADER.writeUInt16LE(TEXT.length || 0, 4);

  return Buffer.concat([
    HEADER,
    TEXT
  ]);

};



const compose = obj => {

  const isUnicode = ('UNICODE' in obj) ? obj.UNICODE : true;


  const HEADER = Buffer.alloc(6, 0);

  // set VER to 0
  HEADER.writeUInt16LE(0, 2);

  // set FLAGS
  let FLAGS = 0;
  FLAGS |= (isUnicode ? 1 : 0);

  HEADER.writeUInt8(FLAGS, 3);


  // SCREEN
  HEADER.writeUInt16LE(Math.max(0, Math.min(obj.screen || 0, 65535)), 4);


  if (!obj.displays?.length) {
    throw new Error('At least one display object is required');
  }

  const DMSGS = [];
  for (const display of obj.displays || []) {
    DMSGS.push(composeDMSG(display, { UNICODE: isUnicode }));
  }



  const buf = Buffer.concat([
    HEADER,
    ...DMSGS
  ]);

  // set PBC
  buf.writeUInt16LE(buf.length - 2, 0);

  return buf;
};

const parse = buf => {

  const PBC = buf.readUInt16LE(0);
  const VER = buf.readUInt8(2);



  const FLAGS = buf.readUInt8(3);
  const SCREEN = buf.readUInt16LE(4);

  const isUnicode = !!(FLAGS & 0b1);


  const displays = [];

  let offset = 6;
  while (offset < PBC) {

    const INDEX = buf.readUInt16LE(offset);
    offset += 2;

    const CONTROL = buf.readUInt16LE(offset);
    offset += 2;

    // Display Data
    if (((CONTROL >> 15) & 1) === 0) {
      const LENGTH = buf.readUInt16LE(offset);
      offset += 2;

      const TEXT = buf.subarray(offset, offset + LENGTH);
      offset += LENGTH;

      displays.push({
        index: INDEX,
        RH: CONTROL & 0b11,
        TXT: (CONTROL >> 2) & 0b11,
        LH: (CONTROL >> 4) & 0b11,
        brightness: (CONTROL >> 6) & 0b11,
        label: TEXT.toString(isUnicode ? 'utf16le' : 'ascii')
      });

    }

    // Control Data
    else {
      throw new Error('Not defined/implemented');
    }

  }


  return {
    version: `5.${VER}`,
    screen: SCREEN === 65535 ? 'all' : SCREEN,
    displays
  }
};

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  compose: compose,
  parse: parse
});

exports.v3 = index$2;
exports.v4 = index$1;
exports.v5 = index;
