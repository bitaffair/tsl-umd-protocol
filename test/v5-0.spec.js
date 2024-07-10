'use strict';

import { expect } from '@hapi/code';
import { v5 } from '@bitaffair/tsl-umd-protocol';
import { Duplex } from 'node:stream';
import { once } from 'node:events';

const { compose, parse, wrapForStream, unwrapFromStream, DLE, STX, unstuff, StreamUnwrapTransformer } = v5;

describe('v5.0', () => {

  describe('compose(obj)', () => {

    it('should', () => {

      const buf = compose({
        displays: [{
          index: 0
        }]
      });

      expect(buf)
        .to.be.a.buffer();


    });

  });


  describe('parse -> compose', () => {

    const DEFAULT_OBJECT = {
      displays: [{
        index: 0
      }]
    };


    describe('.version', () => {
      it('should be 5.0 by default', () => {

        expect(parse(compose({
          ...DEFAULT_OBJECT
        })))
          .to.contain({
            version: '5.0',
          });

      });

    });

    describe('.screen', () => {

      it('should be 0 if not set', () => {

        expect(parse(compose({
          ...DEFAULT_OBJECT
        })))
          .to.contain({
            screen: 0,

          });

      });

      it('should be 0 if null', () => {

        expect(parse(compose({
          ...DEFAULT_OBJECT,
          screen: null
        })))
          .to.contain({
            screen: 0
          });

      });

      it('should be 0 if false', () => {

        expect(parse(compose({
          ...DEFAULT_OBJECT,
          screen: false
        })))
          .to.contain({
            screen: 0
          });

      });

      it('should be 0 if undefined', () => {

        expect(parse(compose({
          ...DEFAULT_OBJECT,
          screen: undefined
        })))
          .to.contain({
            screen: 0
          });

      });

      it('should be 0 if negative', () => {

        expect(parse(compose({
          ...DEFAULT_OBJECT,
          screen: -3
        })))
          .to.contain({
            screen: 0
          });

      });

      it('should be 5 if set to 5', () => {

        expect(parse(compose({
          ...DEFAULT_OBJECT,
          screen: 5
        })))
          .to.contain({
            screen: 5
          });

      });

      it('should be all if set to Infinity', () => {

        expect(parse(compose({
          ...DEFAULT_OBJECT,
          screen: Infinity
        })))
          .to.contain({
            screen: 'all'
          });

      });

      it('should be all if set bigger than 65534', () => {

        expect(parse(compose({
          ...DEFAULT_OBJECT,
          screen: 65535
        })))
          .to.contain({
            screen: 'all'
          });

      });


    });

    describe('.displays', () => {

      for (const ATTR of ['brightness', 'LH', 'TXT', 'RH']) {

        describe(`.${ATTR}`, () => {

          it('should be 0 if empty', () => {

            expect(parse(compose({
              displays: [{
                index: 0
              }]
            })).displays[0])
              .to.contain({
                [ATTR]: 0
              });

          });

          it('should be 0 if null', () => {

            expect(parse(compose({
              displays: [{
                index: 0,
                [ATTR]: null
              }]
            })).displays[0])
              .to.contain({
                [ATTR]: 0
              });

          });

          it('should be 0 if undefined', () => {

            expect(parse(compose({
              displays: [{
                index: 0,
                [ATTR]: undefined
              }]
            })).displays[0])
              .to.contain({
                [ATTR]: 0
              });

          });

          it('should be 1', () => {

            expect(parse(compose({
              displays: [{
                index: 0,
                [ATTR]: 1
              }]
            })).displays[0])
              .to.contain({
                [ATTR]: 1
              });

          });

          it('should be 2', () => {

            expect(parse(compose({
              displays: [{
                index: 0,
                [ATTR]: 2
              }]
            })).displays[0])
              .to.contain({
                [ATTR]: 2
              });

          });

          it('should be 3', () => {

            expect(parse(compose({
              displays: [{
                index: 0,
                [ATTR]: 3
              }]
            })).displays[0])
              .to.contain({
                [ATTR]: 3
              });

          });

          it('should be 3 if bigger than 3', () => {

            expect(parse(compose({
              displays: [{
                index: 0,
                [ATTR]: 4
              }]
            })).displays[0])
              .to.contain({
                [ATTR]: 3
              });

          });


        });
      }


      describe('.label', () => {

        it('should be an empty string if not set', () => {

          expect(parse(compose({
            displays: [{
              index: 0
            }]
          })).displays[0])
            .to.contain({
              label: ''
            });

        });

        it('should be an empty string if null', () => {

          expect(parse(compose({
            displays: [{
              index: 0,
              label: null
            }]
          })).displays[0])
            .to.contain({
              label: ''
            });

        });

        it('should be an empty string if undefined', () => {

          expect(parse(compose({
            displays: [{
              index: 0,
              label: undefined
            }]
          })).displays[0])
            .to.contain({
              label: ''
            });

        });

        it('should be an empty string if false', () => {

          expect(parse(compose({
            displays: [{
              index: 0,
              label: false
            }]
          })).displays[0])
            .to.contain({
              label: ''
            });

        });

        it('should be an empty string if true', () => {

          expect(parse(compose({
            displays: [{
              index: 0,
              label: true
            }]
          })).displays[0])
            .to.contain({
              label: ''
            });

        });

        it('should be expected string', () => {

          expect(parse(compose({
            displays: [{
              index: 0,
              label: 'Hello World'
            }]
          })).displays[0])
            .to.contain({
              label: 'Hello World'
            });

        });

        it('should be expected string containing unicode chars', () => {

          expect(parse(compose({
            displays: [{
              index: 0,
              label: 'ع - 😎'
            }]
          })).displays[0])
            .to.contain({
              label: 'ع - 😎'
            });

        });

        it('should be expected string if UNICODE=false', () => {

          expect(parse(compose({
            UNICODE: false,
            displays: [{
              index: 0,
              label: 'Hello World'
            }]
          })).displays[0])
            .to.contain({
              label: 'Hello World'
            });

        });

      });

    });

  });


  describe('STREAM', () => {

    describe('wrapForStream(buf)', () => {

      it('should wrap', () => {

        const buf = wrapForStream(Buffer.from(['a', 'b', 'c', DLE, 'e', DLE, 'g']));

        expect(buf)
          .to.equal(Buffer.from([DLE, STX, 'a', 'b', 'c', DLE, DLE, 'e', DLE, DLE, 'g']))

      });

    });


    describe('unwrapFromStream(buf)', () => {

      it('should unwrap', () => {

        const buf = unwrapFromStream(Buffer.from([DLE, STX, 'a', 'b', 'c', DLE, DLE, 'e', DLE, DLE, 'g']));

        expect(buf)
          .to.equal(Buffer.from(['a', 'b', 'c', DLE, 'e', DLE, 'g']));

      });

    });


    // it.skip('parsing should always unwrap', () => {

    //   const buf = compose({
    //     STREAM: true,
    //     displays: [{
    //       index: 0
    //     }]
    //   });

    //   expect(buf.subarray(0, 2))
    //     .to.equal(Buffer.from([DLE, STX]));

    //   const msg = parse(buf);

    //   expect(msg)
    //     .to.be.an.object()
    //     .to.contain({
    //       version: '5.0',
    //       STREAM: true
    //     });

    // });



    describe('unstuff(buffer)', () => {

      it('should remove double DLEs', () => {

        const buf = unstuff(Buffer.from([1, 2, 3, DLE, DLE, 5, DLE, DLE, STX]));

        expect(buf)
          .to.equal(Buffer.from([1, 2, 3, DLE, 5, DLE, STX]));
      });

    });


    describe('StreamUnwrapTransformer', () => {

      let transformer;
      beforeEach(() => {
        transformer = new StreamUnwrapTransformer();
        transformer.on('error', (err) => console.log('error', err))
      });


      it('should buffer, transform and emit parsed packets', async () => {

        const socket = Duplex.from('');
        socket.pipe(transformer);

        const raw = compose({
          displays: [{
            index: 0,
            label: 'Hello World'
          }]
        });

        const buf = wrapForStream(raw);

        socket.push(buf.subarray(0, 10));
        socket.push(buf.subarray(10));
        socket.push('asd');
        socket.push(buf.subarray(0, 20));
        socket.push(buf.subarray(20));
        socket.push('noise');
        socket.push(Buffer.concat([buf, buf, buf]));

        const messages = [];
        await new Promise(resolve => {
          transformer.on('data', msg => {
            messages.push(msg);
            if (messages.length === 5) {
              resolve()
            }
          });
        });


        for (const msg of messages) {
          expect(msg)
            .to.be.a.buffer();

          expect(msg)
            .to.equal(raw);
        }


      })

    });



  });



});