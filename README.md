# @bitaffair/tsl-umd-protocol

[![Test CI](https://github.com/bitaffair/tsl-umd-protocol/actions/workflows/testing.js.yml/badge.svg)](https://github.com/bitaffair/tsl-umd-protocol/actions/workflows/testing.js.yml)

This module contains all versions of TSL-UMD protocol to control *tally lights* and *under monitor displays*. Its single purpose is to `compose` and `parse` binary messages. Sending and receiving is not part if it. All details about the protocol are based on the specification in [this document](https://tslproducts.com/media/1959/tsl-umd-protocol.pdf). This library is **inofficial** and therefore is **not developed or supported by [TSL Products](https://tslproducts.com/)**.


## Installation
```shell
npm install @bitaffair/tsl-umd-protocol
```


## Usage

Each major version can be imported separately containing a `compose` and a `parse` method.

```javascript
import { v3, v4, v5 } from '@bitaffair/tsl-umd-protocol';
const { compose, parse } = v3 // or v4 or v5;

// use compose method to create the binary message
const buffer = compose(messageObject);

// use parse method to create message object from binary message
const parsedMessageObject = parse(buffer);
```

Implemented versions:
| Import | Versions | 
| :----: | :------- |
| v3     | v3.1     |   
| v4     | v4.0     |   
| v5     | v5.0     |   


## v3.1

- `address` *(Number)* Display address (0-126)
- `brightness` *(Number)* Brightness (0-3)
- `label` *(String)* Display label (max. 16 chars ASCII)
- `version` *(String, Always: 3.1)*
- `t1` *(Boolean)* Tally 1 status
- `t2` *(Boolean)* Tally 2 status
- `t3` *(Boolean)* Tally 3 status
- `t4` *(Boolean)* Tally 4 status

## v4.0

- `address` *(Number)* Display address (0-126)
- `brightness` *(Number)* Brightness (0-3)
- `label` *(String)* Display label (max. 16 chars ASCII)
- `version` *(String, Default: 4.0)*
- `displayL` & `displayR` *(Object)* with same structure:
  - `LH` *(Number)* Left tally color (0-3)
  - `RH` *(Number)* Right tally color (0-3)
  - `TXT` *(Number)* Text color (0-3)


## v5.0

- `screen` *(Number | String, Default: 0)* Select a specific screen. If not set it will be 0. Use `all` or `65535` to address all screens.
- `version` *(String, Default: 5.0)* 
- `displays` *(Array, required)* An array of objects:
  - `brightness` *(Number)* Brightness (0-3)
  - `LH` *(Number)* Left tally color (0-3)
  - `RH` *(Number)* Right tally color (0-3)
  - `TXT` *(Number)* Text color (0-3)
  - `label` *(String)* Display label (Unicode by default)
- `UNICODE` *(Boolean, Default: true)* If set to `false` labels will be ASCII encoded during composition.
- `STREAM` *(Boolean, Default: false)* If set the returned buffer is prepared for stream transport with DLE/STX prefix and stuffed DLE characters. Use this for TCP or other stream interfaces.

### StreamUnwrapTransformer()

It implements a [Transform](https://nodejs.org/api/stream.html#new-streamtransformoptions) which can be used on fragmented source streams (like a TCP socket) to get clean, unwrapped and parsable buffers from chunks.

**Example usage on a TCP socket:**
```javascript
import net from 'node:net';
import { v5 } from '@bitaffair/tsl-umd-protocol';

net.createServer(socket => {
  const transformer = new v5.StreamUnwrapTransformer();

  transformer.on('data', buf => {
    const obj = v5.parse(buf);
    // go on from here
  });

  socket.pipe(transformer);
});

```



## License
(The MIT License)

Copyright (c) 2024 Bitaffair GmbH <hello@bitaffair.io>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
