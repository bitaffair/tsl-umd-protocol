'use strict';


import { unwrapFromStream, isWrapped } from './stream.js';



export const parse = buf => {

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


