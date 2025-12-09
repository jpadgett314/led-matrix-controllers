import { close, getUnusedPort } from '../../../web-serial/port.js';
import { PortMutex } from '../../../web-serial/PortMutex.js';
import { PortOperations } from '../../../web-serial/PortOperations.js';
import { CommandAbstractionLayer } from './CommandAbstractionLayer.js';
import { BitDepth } from './commands.js';

export class DefaultController extends CommandAbstractionLayer {
  async bootloader() {
    return super.bootloader();
  }

  async connect() {
    const port = await getUnusedPort();

    if (port?.connected) {
      await close(port);
      await port.open({ baudRate: 115200 });
      this.portMutex = new PortMutex(new PortOperations(port));
    } else {
      throw new Error('No Port Found');
    }
  }

  async draw(matrix) {
    switch (this.bitDepth ?? BitDepth.MONO_1BIT) {

      case (BitDepth.GRAY_8BIT):
        super.drawGrayscale(matrix);
        break;

      case (BitDepth.MONO_1BIT):
        super.draw(matrix);
        break;

      default:
        console.error(`Unsupported bitdepth: ${this.bitDepth}`);
    }
  }

  async verifyFirmware() {
    try {
      const version = await super.version();

      return version
        && version.major != undefined
        && version.minor != undefined
        && version.patch != undefined
        && version.preRelease != undefined;
        
    } catch {
      return false;
    }
  }

  async version() {
    return super.version();
  }
}
