'use strict';

import { expect } from '@hapi/code';
import { parse, compose } from '../lib/v4-0/index.js';



describe('v4.0', () => {

  const BUFREF_1 = [0x84, 0x00, 0x54, 0x53, 0x4c, 0x34, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x55, 0x02, 0x16, 0x26];

  describe('parse', () => {

    it('should parse to expected data', () => {

      const data = parse(Buffer.from(BUFREF_1));

      expect(data)
        .to.equal({
          address: 4,
          brightness: 0,
          label: 'TSL4',
          version: '4.0',
          displayL: {
            LH: 1,
            RH: 2,
            TXT: 1,
          },
          displayR: {
            LH: 2,
            RH: 2,
            TXT: 1,
          }
        })

    });

  });


  describe('compose', () => {

    it('should return buffer', () => {

      const buf = compose({
        address: 4,
        brightness: 0,
        label: 'TSL4',
        version: '4.0',
        displayL: {
          LH: 1,
          RH: 2,
          TXT: 1,
        },
        displayR: {
          LH: 2,
          RH: 2,
          TXT: 1,
        }
      });

      expect(buf)
        .to.be.a.buffer()
        .to.equal(Buffer.from(BUFREF_1));

    });

  });


  describe('compose > parse', () => {

    it('input should euqal output', () => {

      const input = {
        address: 4,
        brightness: 3,
        label: 'CAM 1',
        version: '4.0',
        displayL: {
          LH: 0,
          RH: 0,
          TXT: 0
        },
        displayR: {
          LH: 0,
          RH: 0,
          TXT: 0
        }
      };

      expect(parse(compose(input)))
        .to.equal(input);

    });



    describe('.address', () => {

      it('address: false should use address = 0', () => {

        expect(parse(compose({
          address: false,
          brightness: 3,
          label: 'CAM 1',

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

        })))
          .to.contain({
            address: 0
          });

      });

      it('address lt 0 should result in address = 0', () => {

        expect(parse(compose({
          address: -50,
          brightness: 3,
          label: 'CAM 1',

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

        })))
          .to.contain({
            address: 127
          });

      });

    });


    describe('.brightness', () => {
      it('brightness: null should use brightness = 0', () => {

        expect(parse(compose({
          address: 0,
          brightness: null,
          label: 'CAM 1',

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

        })))
          .to.contain({
            brightness: 0
          });

      });



      it('brightness lt 0 should result in brightness = 0', () => {

        expect(parse(compose({
          address: 4,
          brightness: -3,
          label: 'CAM 1',

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

        })))
          .to.contain({
            brightness: 3
          });

      });


    });


    for (const display of ['displayL', 'displayR']) {

      describe(`.${display}`, () => {

        for (const attr of ['LH', 'RH', 'TXT']) {

          describe(`.${attr}`, () => {

            for (let val = 0; val < 3; val++) {
              it(`should equal ${val}`, () => {
                expect(parse(compose({
                  address: 0,
                  brightness: undefined,
                  label: 'CAM 1',
                  [display]: {
                    [attr]: val
                  }
                }))[display])
                  .to.contain({
                    [attr]: val
                  });
              });
            }

            it(`negative value should be replaced by 0`, () => {
              expect(parse(compose({
                address: 0,
                brightness: undefined,
                label: 'CAM 1',
                [display]: {
                  [attr]: -1
                }
              }))[display])
                .to.contain({
                  [attr]: 0
                });
            });

            it(`value greater than 3 should be replaced by 3`, () => {
              expect(parse(compose({
                address: 0,
                brightness: undefined,
                label: 'CAM 1',
                [display]: {
                  [attr]: 5
                }
              }))[display])
                .to.contain({
                  [attr]: 3
                });
            });

          });


        }

      });

    }


  });

});