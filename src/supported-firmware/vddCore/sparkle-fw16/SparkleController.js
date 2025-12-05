import { HEIGHT, WIDTH } from '../../../hardware-constants.js';
import { getDevice } from '../../../web-hid/device.js';
import { HIDOperations } from '../../../web-hid/HIDOperations.js';
import { ReportAbstractionLayer } from './ReportAbstractionLayer.js';
import { BootMode } from './reports.js';

export class SparkleController extends ReportAbstractionLayer {
  async bootloader() {
    await super.reboot(BootMode.BOOTSEL);
  }

  async connect() {
    const device = await getDevice();
    if (device) {
      await device.open();
      this.device = new HIDOperations(device);
    }
  }
  
  async draw(matrix) {
    await super.drawMatrix(matrix);
  }

  async verifyFirmware() {
    try {
      const info = await super.info();
      return (
        info.display_height == HEIGHT &&
        info.display_width == WIDTH
      );
    } catch {
      return false;
    }
  }

  async version() {
    const info = await super.info();
    if (info.version_major != undefined 
      && info.version_minor != undefined
      && (info.version_major > 0 || info.version_minor > 0)) {
      return {
        major: info.version_major,
        minor: info.version_minor
      }
    } else {
      // Sparkle <=1.1.1: Glitter version unavailable 
      return { major: 1, minor: 0 };
    }
  }
}
