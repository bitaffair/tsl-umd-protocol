'use strict';



export const parse = buf => {

  const HEADER = buf[0];
  const CTRL = buf[1];
  const DATA = buf.subarray(2);

  const type = (CTRL & (1 << 6)) >> 6;

  // display data
  if (type === 0) {

    const address = HEADER - 0x80;
    const brightness = (CTRL >> 4) & 0b11;
    const t1 = CTRL & 0b1;
    const t2 = (CTRL >> 1) & 0b1;
    const t3 = (CTRL >> 2) & 0b1;
    const t4 = (CTRL >> 3) & 0b1;
    const label = DATA.subarray(0, DATA.indexOf('\0')).toString();

    return {
      version: '3.1',
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

}