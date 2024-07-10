'use strict';


import { Transform } from 'node:stream';


export const DLE = 0xFE;
export const STX = 0x02;

const DLE_ESCAPED = Buffer.from([DLE, DLE]);

const PACKET_DELIMITER = Buffer.from([DLE, STX]);



/**
 * Check for presence of packet start DLE/STX
 * 
 * @param {Buffer} buf 
 * @returns true/false
 */
export const isWrapped = buf => {
  return buf[0] === DLE && buf[1] === STX;
}




export const unstuff = buf => {
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
  return buf;
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
  buf = unstuff(buf);

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









/**
 * Stream transformer to buffer data until a full message is received.
 * Emits unwrapped and unstuffed messages which can be parsed then.
 */
export class StreamUnwrapTransformer extends Transform {

  #buffer = Buffer.alloc(0);

  #processBuffer() {
    const packetStartIndex = this.#buffer.indexOf(PACKET_DELIMITER);

    if (packetStartIndex > -1) {

      // PBC value + 2 bytes of PBC itself is total length of packet
      const packetLength = this.#buffer.readUint16LE(packetStartIndex + PACKET_DELIMITER.length) + 2;

      if ((this.#buffer.length - packetStartIndex) < packetLength) {
        // buffer has not enough data
        return
      } else {
        const pStart = packetStartIndex + PACKET_DELIMITER.length;
        const pEnd = pStart + packetLength;

        const raw = this.#buffer.subarray(pStart, pEnd);
        this.#buffer = this.#buffer.subarray(packetStartIndex + PACKET_DELIMITER.length + packetLength);

        try {
          this.push(raw);
          this.#processBuffer();
        } catch (err) {
          this.emit('error', err);
        }
      }

    }
  }


  _transform(chunk, encoding, callback) {
    this.#buffer = unstuff(Buffer.concat([this.#buffer, chunk]));
    this.#processBuffer();
    callback(null);
  }

}


