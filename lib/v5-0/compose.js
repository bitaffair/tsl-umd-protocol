'use strict';


const SCONTROL = 1;
const DMSG = 1;




const composeDMSG = obj => {

  const INDEX = 0;
  const CONTROL = 0;
  const LENGTH = 0;
  const TEXT = Buffer.from('');

};



export const compose = obj => {

  const HEADER = Buffer.alloc(6, 0);

  // set VER
  HEADER.writeUInt16LE(0, 2);

  // set FLAGS
  // -> actually not needed cause all bits are 0 for DMSG ASCII data

  // SCREEN
  HEADER.writeUInt16LE(Math.max(0, Math.min(obj.screen || 0, 65535)), 4);


  const buf = Buffer.concat([
    HEADER
  ]);

  // set PBC
  buf.writeUInt16LE(buf.length - 2, 0);

  return buf;
};