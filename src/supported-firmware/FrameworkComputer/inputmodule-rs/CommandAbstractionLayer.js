import { HEIGHT, VID_ARR, WIDTH } from '../../../hardware-constants.js';
import { Command, RX_PACKET_SZ } from './commands.js';

export class CommandAbstractionLayer {
  constructor(portMutex = null) {
    this.portMutex = portMutex;
  }

  async bootloader() {
    await this.portMutex.acquire(async p => {
      await p.tx([...VID_ARR, Command.BOOTLOADER]);
    });
  }

  async brightness(brightness) {
    await this.portMutex.acquire(async p => {
      await p.tx([...VID_ARR, Command.BRIGHTNESS, brightness]);
    });
  }

  async draw(matrix) {
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

    await this.portMutex.acquireIdempotent(
      'drawMatrix', 
      async p => {
        await p.tx([...VID_ARR, Command.DRAW, ...output]);
      }
    );
  }

  async drawGrayscale(matrix) {
    // Transpose & Gamma Correction
    const buffers = Array.from(
      { length: WIDTH }, 
      (_, c) => new Array(
        { length: HEIGHT }, 
        (_, r) => GAMMA[Math.floor((matrix[r][c] ?? 0) * 255)]
      )
    );

    // Only execute the most recent call 
    await this.portMutex.acquireIdempotent(
      'drawMatrix', 
      async p => {
        for (let i = 0; i < WIDTH; i++) {
          await p.tx([...VID_ARR, Command.STAGE_GREY_COL, i, ...buffers[i]]);
        }
        await p.tx([...VID_ARR, Command.DRAW_GREY_COL_BUFFER]);
      }
    );
  }

  async asleep() {
    let asleep = false;

    await this.portMutex.acquire(async p => {
      await p.tx([...VID_ARR, Command.SLEEP]);
      asleep = await p.rx(RX_PACKET_SZ);
      asleep = asleep[0] != 0x00;
    });

    return asleep;
  }

  async sleep() {
    await this.portMutex.acquire(async p => {
      await p.tx([...VID_ARR, Command.SLEEP, 0x01]);
    });
  }

  async wake() {
    await this.portMutex.acquire(async p => {
      await p.tx([...VID_ARR, Command.SLEEP]);
    });
  }

  async pattern(pattern) {
    await this.portMutex.acquireIdempotent(
      'drawMatrix',
      async p => {
        await p.tx([...VID_ARR, Command.PATTERN, pattern]);
      }
    );
  }

  async percent(percent) {
    await this.portMutex.acquireIdempotent(
      'drawMatrix',
      async p => {
        await p.tx([...VID_ARR, Command.PATTERN, Pattern.PERCENTAGE, percent]);
      }
    );
  }

  async version() {
    let ver = {};

    await this.portMutex.acquire(async p => {
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
}
