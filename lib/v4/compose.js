'use strict';

import { compose as _composeV3 } from '../v3/index.js'
import { checksum } from './checksum.js';
import { XDATA40_compose } from './xdata.js';



export const compose = (obj) => {

  let buf = _composeV3(obj);


  const CHKSUM = checksum(buf);

  let VBC = 0;
  const XDATA_ByteCount = 2;
  VBC |= (XDATA_ByteCount & 0b111);

  const XDATA = XDATA40_compose(obj);

  return Buffer.concat([
    buf,
    Buffer.from([
      CHKSUM,
      VBC
    ]),
    XDATA
  ]);
}