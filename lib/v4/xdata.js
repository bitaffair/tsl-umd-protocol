'use strict';





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
}





export const XDATA40_parse = buf => {

  if (buf.length !== 2) {
    throw new Error('Expected XDATA to contain two bytes');
  }

  return {
    displayL: XDATA40_parseDisplay(buf[0]),
    displayR: XDATA40_parseDisplay(buf[1]),
  }
}


const _sanitizeDisplayAttr = val => {
  return Math.max(0, Math.min(val || 0, 3))
}

const XDATA40_composeDisplay = obj => {
  let byte = 0;

  const bit2mask = 0b11;

  byte |= (_sanitizeDisplayAttr(obj.LH) & bit2mask) << 4;
  byte |= (_sanitizeDisplayAttr(obj.TXT) || 0 & bit2mask) << 2;
  byte |= (_sanitizeDisplayAttr(obj.RH) || 0 & bit2mask);

  return byte;
};




export const XDATA40_compose = data => {
  return Buffer.from([
    XDATA40_composeDisplay(data.displayL || {}),
    XDATA40_composeDisplay(data.displayR || {}),
  ]);
};