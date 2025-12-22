import { close, getUnusedPort } from '../../../environments/web/usb-serial/port.js';
import { PortMutex } from '../../../environments/web/usb-serial/PortMutex.js';
import { PortOperations } from '../../../environments/web/usb-serial/PortOperations.js';
import { CommandAbstractionLayer } from './CommandAbstractionLayer.js';
import { BitDepth } from './commands.js';

export class DefaultController extends CommandAbstractionLayer {
  async bootloader() {
    await super.bootloader();
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
        await super.drawGrayscale(matrix);
        break;

      case (BitDepth.MONO_1BIT):
        await super.draw(matrix);
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
