'use strict';




export const compose = data => {

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
}

