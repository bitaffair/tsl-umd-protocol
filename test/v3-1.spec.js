'use strict';

import { expect } from '@hapi/code';
import { v3 } from '@bitaffair/tsl-umd-protocol';
const { compose, parse } = v3;




describe('v3.1', () => {
  const BUFREF_1 = [0x81, 0x31, 0x43, 0x41, 0x4d, 0x20, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];

  describe('parse', () => {

    it('should parse to expected data', () => {

      const data = parse(Buffer.from(BUFREF_1));

      expect(data)
        .to.equal({
          version: '3.1',
          address: 1,
          brightness: 3,
          label: 'CAM 1',
          t1: 1,
          t2: 0,
          t3: 0,
          t4: 0,
        })

    });

  });


  describe('compose', () => {

    it('should return buffer', () => {

      const buf = compose({
        address: 1,
        brightness: 3,
        label: 'CAM 1',
        t1: 1,
        t2: 0,
        t3: 0,
        t4: 0
      });

      expect(buf)
        .to.be.a.buffer()
        .to.equal(Buffer.from(BUFREF_1))
    });

  });


  describe('compose > parse', () => {

    it('input should equal output', () => {
      const input = {
        version: '3.1',
        address: 4,
        brightness: 3,
        label: 'CAM 1',
        t1: 1,
        t2: 1,
        t3: 0,
        t4: 1,
      }

      expect(parse(compose(input)))
        .to.equal(input);

    })


    it('address lt 0 should result in address = 0', () => {

      expect(parse(compose({
        address: -50,
        brightness: 3,
        label: 'CAM 1',
        t1: 0,
        t2: 0,
        t3: 0,
        t4: 0,
      })))
        .to.contain({
          address: 0
        });

    });



    it('address gt 127 should result in address = 127', () => {

      expect(parse(compose({
        address: 400,
        brightness: 3,
        label: 'CAM 1',
        t1: 0,
        t2: 0,
        t3: 0,
        t4: 0,
      })))
        .to.contain({
          address: 127
        });

    });



    it('brightness lt 0 should result in brightness = 0', () => {

      expect(parse(compose({
        address: 4,
        brightness: -3,
        label: 'CAM 1',
        t1: 0,
        t2: 0,
        t3: 0,
        t4: 0,
      })))
        .to.contain({
          brightness: 0
        });

    });



    it('brightness gt 3 should result in brightness = 3', () => {

      expect(parse(compose({
        address: 4,
        brightness: 5,
        label: 'CAM 1',
        t1: 0,
        t2: 0,
        t3: 0,
        t4: 0,
      })))
        .to.contain({
          brightness: 3
        });

    });


    it('tally should be 1 on truly values', () => {

      expect(parse(compose({
        address: 4,
        brightness: 5,
        label: 'CAM 1',
        t1: true,
        t2: 1,
        t3: 'a',
        t4: '1',
      })))
        .to.contain({
          t1: 1,
          t2: 1,
          t3: 1,
          t4: 1
        });

    });

    it('tally should be 0 on falsy values', () => {

      expect(parse(compose({
        address: 4,
        brightness: 5,
        label: 'CAM 1',
        t1: false,
        t2: 0,
        t3: null,
        t4: undefined,
      })))
        .to.contain({
          t1: 0,
          t2: 0,
          t3: 0,
          t4: 0
        });

    });




    it('address: false should use address = 0', () => {

      expect(parse(compose({
        address: false,
        brightness: 3,
        label: 'CAM 1',
        t1: 0,
        t2: 0,
        t3: 0,
        t4: 0,
      })))
        .to.contain({
          address: 0
        });

    });

    it('address: null should use address = 0', () => {

      expect(parse(compose({
        address: null,
        brightness: 3,
        label: 'CAM 1',
        t1: 0,
        t2: 0,
        t3: 0,
        t4: 0,
      })))
        .to.contain({
          address: 0
        });

    });

    it('address: undefined should use address = 0', () => {

      expect(parse(compose({
        address: undefined,
        brightness: 3,
        label: 'CAM 1',
        t1: 0,
        t2: 0,
        t3: 0,
        t4: 0,
      })))
        .to.contain({
          address: 0
        });

    });


    it('brightness: null should use brightness = 0', () => {

      expect(parse(compose({
        address: 0,
        brightness: null,
        label: 'CAM 1',
        t1: 0,
        t2: 0,
        t3: 0,
        t4: 0,
      })))
        .to.contain({
          brightness: 0
        });

    });



    it('brightness: false should use brightness = 0', () => {

      expect(parse(compose({
        address: 0,
        brightness: false,
        label: 'CAM 1',
        t1: 0,
        t2: 0,
        t3: 0,
        t4: 0,
      })))
        .to.contain({
          brightness: 0
        });

    });



    it('brightness: undefined should use brightness = 0', () => {

      expect(parse(compose({
        address: 0,
        brightness: undefined,
        label: 'CAM 1',
        t1: 0,
        t2: 0,
        t3: 0,
        t4: 0,
      })))
        .to.contain({
          brightness: 0
        });

    });




  });

});