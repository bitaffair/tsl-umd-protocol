'use strict';



export const parse = buf => {

  const PBC = buf.readUInt16LE(0);

  const SCREEN = buf.readUInt16LE(4);

  return {
    screen: SCREEN === 65535 ? 'all' : SCREEN
  }
};