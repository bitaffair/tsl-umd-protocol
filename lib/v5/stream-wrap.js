'use strict';


export const DLE = 0xFE;
export const STX = 0x02;

const DLE_ESCAPED = Buffer.from([DLE, DLE]);

/**
 * Check for presence of packet start DLE/STX
 * 
 * @param {Buffer} buf 
 * @returns true/false
 */
export const isWrapped = buf => {
  return buf[0] === DLE && buf[1] === STX;
}




/**
 * Remove packet start DLE/STX and unstuff DLE/DLE
 * 
 * @param {Buffer} buf 
 * @returns Buffer
 */
export const unwrapFromStream = buf => {

  if (!isWrapped(buf)) {
    return buf;
  }

  // remove packet start
  buf = buf.subarray(2);

  // unstuff DLE/DLE
  while (true) {
    const index = buf.indexOf(DLE_ESCAPED);

    if (index === -1) {
      break;
    }

    buf = Buffer.concat([
      buf.subarray(0, index),
      buf.subarray(index + 1),
    ]);
  }

  return buf
}






export const wrapForStream = buf => {

  // add packe start DLE/STX
  buf = Buffer.concat([
    Buffer.from([DLE, STX]),
    buf
  ]);

  // stuff occurrence of DLE to DLE/DLE
  let offset = 2;
  while (true) {
    let index = buf.indexOf(DLE, offset);

    if (index === -1) {
      break;
    }

    buf = Buffer.concat([
      buf.subarray(0, index),
      DLE_ESCAPED,
      buf.subarray(index + 1)
    ]);

    offset = index + 2;
  }

  return buf;
}