'use strict';


const SCONTROL = 1;
const DMSG = 1;



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



export const compose = obj => {

  const isUnicode = ('UNICODE' in obj) ? obj.UNICODE : true;


  const HEADER = Buffer.alloc(6, 0);

  // set VER
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