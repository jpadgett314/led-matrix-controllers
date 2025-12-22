import { HEIGHT, WIDTH } from '../../../hardware-constants.js';
import { getUnusedDevice } from '../../../environments/web/usb-hid/device.js';
import { HIDOperations } from '../../../environments/web/usb-hid/HIDOperations.js';
import { ReportAbstractionLayer } from './ReportAbstractionLayer.js';
import { BootMode } from './reports.js';

export class SparkleController extends ReportAbstractionLayer {
  async bootloader() {
    await super.reboot(BootMode.BOOTSEL);
  }

  async connect() {
    const device = await getUnusedDevice();

    if (device) {
      await device.open();
      this.device = new HIDOperations(device);
    } else {
      throw new Error('No Device Found');
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
      };
    } else {
      // Sparkle <=1.1.1: Glitter version unavailable 
      return { major: 1, minor: 0 };
    }
  }
}
