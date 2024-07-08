'use strict';

import { expect } from '@hapi/code';
import { parse, compose } from '../lib/v5-0/index.js';



describe('v5.0', () => {

  describe('compose(obj)', () => {

    it('should', () => {

      const buf = compose({

      });

      expect(buf)
        .to.be.a.buffer();


    });

  });


  describe('parse -> compose', () => {

    describe('.screen', () => {

      it('should be 0 if not set', () => {

        expect(parse(compose({})))
          .to.contain({
            screen: 0
          });

      });

      it('should be 0 if null', () => {

        expect(parse(compose({
          screen: null
        })))
          .to.contain({
            screen: 0
          });

      });

      it('should be 0 if false', () => {

        expect(parse(compose({
          screen: false
        })))
          .to.contain({
            screen: 0
          });

      });

      it('should be 0 if undefined', () => {

        expect(parse(compose({
          screen: undefined
        })))
          .to.contain({
            screen: 0
          });

      });

      it('should be 0 if negative', () => {

        expect(parse(compose({
          screen: -3
        })))
          .to.contain({
            screen: 0
          });

      });

      it('should be 5 if set to 5', () => {

        expect(parse(compose({
          screen: 5
        })))
          .to.contain({
            screen: 5
          });

      });

      it('should be all if set to Infinity', () => {

        expect(parse(compose({
          screen: Infinity
        })))
          .to.contain({
            screen: 'all'
          });

      });

      it('should be all if set bigger than 65534', () => {

        expect(parse(compose({
          screen: 65535
        })))
          .to.contain({
            screen: 'all'
          });

      });


    })

  });

});