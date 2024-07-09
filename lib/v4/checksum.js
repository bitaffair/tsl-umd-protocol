'use strict';





/**
 * Calculate checksum as 2’s complement of (sum of all V3.1 bytes)) modulo 128
 * @param {Buffer} buf 
 * @returns number
 */
export function checksum(buf) {
  const sum = buf.reduce((a, b) => a + b, 0);
  const complement_1 = ~sum;
  const complement_2 = (complement_1 + 1) & 0xFF;
  return complement_2 % 128;
}
