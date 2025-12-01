import { HEIGHT, VID_ARR, WIDTH } from '../../../hardware-constants.js';
import { BitDepth, Command, RX_PACKET_SZ } from './commands.js';

export class DefaultController {
  constructor(portMutex) {
    this.#bitDepth = BitDepth.MONO_1BIT;
    this.#portMutex = portMutex;
  }

  async verifyFirmware() {
    let packet = null;

    await this.#portMutex.acquire(async p => {
      await p.tx([...VID_ARR, Command.VERSION]);
      packet = await p.rx(RX_PACKET_SZ);
    });

    const isPacket = packet.length == RX_PACKET_SZ;
    const isPadded = packet.slice(3).every(e => e == 0x00);

    return isPacket && isPadded;
  }

  async version() {
    let ver = {};

    await this.#portMutex.acquire(async p => {
      await p.tx([...VID_ARR, Command.VERSION]);
      const response = await p.rx(RX_PACKET_SZ);

      // MMMMMMMM mmmmPPPP 0000000p
      ver.major = response[0];
      ver.minor = response[1] >> 4;
      ver.patch = response[1] & 0x0F;
      ver.preRelease = response[2] == 1;
    });

    return ver;
  }

  async draw(matrix) {
    if (this.#bitDepth == BitDepth.GRAY_8BIT) {
      // Transpose & Gamma Correction
      const payloads = Array.from(
        { length: WIDTH }, 
        (_, c) => new Array(
          { length: HEIGHT }, 
          (_, r) => GAMMA[Math.floor((matrix[r][c] ?? 0) * 255)]
        )
      );

      // Only execute the most recent call 
      await this.#portMutex.acquireIdempotent(
        'drawMatrix', 
        async p => {
          for (let i = 0; i < WIDTH; i++) {
            await p.tx([Command.STAGE_GREY_COL, i, ...payloads[i]]);
          }
          await p.tx([Command.DRAW_GREY_COL_BUFFER]);
        }
      );
    }

    else if (this.#bitDepth == BitDepth.MONO_1BIT) {
      let index = 0;
      let output = new Uint8Array(39).fill(0);

      // Pack cells into bits
      for (let r = 0; r < HEIGHT; r++) {
        for (let c = 0; c < WIDTH; c++) {
          if (matrix[r][c]) {
            output[index >> 3] |= 1 << index % 8;
          }
          index++;
        }
      }

      await this.#portMutex.acquireIdempotent(
        'drawMatrix', 
        async p => {
          await p.tx([...VID_ARR, Command.DRAW, ...output]);
        }
      );
    }
  }

  #bitDepth;
  #portMutex;
}
