'use strict';

import { parse as _parseV3 } from '../v3/index.js';
import { checksum } from './checksum.js';
import { XDATA40_parse } from './xdata.js';






export const parse = (buf) => {

  const objV31 = _parseV3(buf);

  const obj = {
    brightness: objV31.brightness,
    address: objV31.address,
    label: objV31.label
  };

  // CHKSUM
  const CHKSUM = buf[18];

  if (CHKSUM !== checksum(buf.subarray(0, 18))) {
    throw new Error('Checksum missmatch');
  }


  // VBC
  const VBC = buf[19];

  if ((VBC >> 7) & 1 !== 0) {
    throw new Error('Expected bit 7 of VBC to be 0');
  }

  const minVersion = (VBC >> 4) & 0b111;
  obj.version = `4.${minVersion}`;

  // XDATA
  const XDATAByteCount = VBC & 0b111;

  if (minVersion === 0) {
    const xdataParsed = XDATA40_parse(buf.subarray(20, 20 + XDATAByteCount));
    Object.assign(obj, xdataParsed);
  } else {
    throw new Error(`Version not implemented: V4.${minVersion}`);
  }

  return obj;
}