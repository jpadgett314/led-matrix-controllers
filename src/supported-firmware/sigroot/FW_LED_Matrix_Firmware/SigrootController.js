import { close, getPort } from '../../../web-serial/port.js';
import { PortMutex } from '../../../web-serial/PortMutex.js';
import { PortOperations } from '../../../web-serial/PortOperations.js';
import { CommandAbstractionLayer } from './CommandAbstractionLayer.js';
import { IDENTITY_STR_REGEX } from './commands.js';

export class SigrootController extends CommandAbstractionLayer {
  async bootloader() {
    await super.bootloader();
  }

  async connect() {
    const port = await getPort();

    if (port?.connected) {
      await close(port);
      await port.open({ baudRate: 115200 });
      this.portMutex = new PortMutex(new PortOperations(port));
    }
  }

  async draw(matrix) {
    if (!this.#scaleInitialized) {
      await super.setGlobalAnalog(0x20);
      this.#scaleInitialized = true;
    }

    await super.setMatrixPwm(matrix);
  }

  async verifyFirmware() { 
    return await this.version() != null;
  }

  async version() {
    const ident = await super.identityString();
    const match = ident.match(IDENTITY_STR_REGEX);

    if (match && match.length == 3) {
      return {
        major: match[1],
        minor: match[2]
      }
    } else {
      return null;
    }
  }

  #scaleInitialized;
}
