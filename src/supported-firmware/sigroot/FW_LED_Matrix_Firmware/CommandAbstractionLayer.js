import { GAMMA } from '../../../hardware-constants.js';
import { Command, IDENTITY_STR_LEN } from './commands.js';

export class CommandAbstractionLayer {
  constructor(portMutex = null) {
    this.portMutex = portMutex;
  }

  async bootloader() {
    await this.portMutex.acquire(async p => {
      await p.tx([Command.BOOTLOADER]);
    });
  }

  async identityString() {
    let ident = null;

    await this.portMutex.acquire(async p => {
      await p.tx([Command.IDENTITY_STRING]);
      ident = await p.rx(IDENTITY_STR_LEN);
    });

    return String.fromCharCode(...ident);
  }

  async setPixelPwm(r, c, brightness) {
    await this.portMutex.acquire(
      async p => {
        await p.tx([Command.SET_PX_PWM, c, r, brightness]);
      }
    );
  }

  async setGlobalPwm(brightness) {
    await this.portMutex.acquire(
      async p => {
        await p.tx([Command.SET_CONST_PWM, brightness]);
      }
    );
  }

  async setMatrixPwm(matrix) {
    // Only execute the most recent call 
    await this.portMutex.acquireIdempotent(
      'drawMatrix', 
      async p => {
        await p.tx(
          [Command.DRAW_PWM].concat(
            matrix.flat().map(v => 
              GAMMA[Math.floor((v ?? 0) * 255)]
            )
          )
        );
      }
    );
  }

  async setPixelAnalog(r, c, brightness) {
    await this.portMutex.acquire(
      async p => {
        await p.tx([Command.SET_PX_SCALE, c, r, brightness]);
      }
    );
  }

  async setGlobalAnalog(brightness) {
    await this.portMutex.acquire(
      async p => {
        await p.tx([Command.SET_CONST_SCALE, brightness]);
      }
    );
  }

  async setMatrixAnalog(matrix) {
    // Only execute the most recent call 
    await this.portMutex.acquireIdempotent(
      'drawMatrix', 
      async p => {
        await p.tx(
          [Command.DRAW_SCALE].concat(
            matrix.flat().map(v => 
              GAMMA[Math.floor((v ?? 0) * 255)]
            )
          )
        );
      }
    );
  }
}
