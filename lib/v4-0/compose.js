'use strict';

import { compose as _composeV31 } from '../v3-1/index.js'
import { checksum } from './checksum.js';
import { XDATA40_compose } from './xdata.js';



export const compose = (obj) => {

  let buf = _composeV31(obj);


  const CHKSUM = checksum(buf);

  let VBC = 0;
  VBC = VBC | (2 & 0b111);

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