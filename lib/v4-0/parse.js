'use strict';

import { parse as _parse } from '../v3-1/index.js'
import { checksum } from './checksum.js'




export const parse = (buf) => {
  let data = _parse(buf);


  const CHKSUM = buf[18];

  if (CHKSUM !== checksum(buf.subarray(0, 18))) {
    throw new Error('Checksum missmatch');
  }

  const VBC = buf[19];


  // const XDATA

  return data;
}