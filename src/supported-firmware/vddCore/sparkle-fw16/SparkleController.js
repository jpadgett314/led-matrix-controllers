import { HEIGHT, WIDTH } from '../../../hardware-constants.js';
import { getUnusedDevice } from '../../../environments/web/usb-hid/device.js';
import { HIDOperations } from '../../../environments/web/usb-hid/HIDOperations.js';
import { ReportAbstractionLayer } from './ReportAbstractionLayer.js';
import { BootMode } from './reports.js';

export class SparkleController extends ReportAbstractionLayer {
  /**
   * Reboots module to enter bootloader for USB firmware upload
   */
  async bootloader() {
    await super.reboot(BootMode.BOOTSEL);
  }

  /**
   * Automatically connects to an available LED Matrix Module
   */
  async connect() {
    const device = await getUnusedDevice();

    if (device) {
      await device.open();
      this.device = new HIDOperations(device);
    } else {
      throw new Error('No Device Found');
    }
  }
  
  /**
   * Updates entire display
   * @param {Array<Array<number>>} matrix `HEIGHT` rows of `WIDTH` columns of [0, 1]
   */
  async draw(matrix) {
    await super.drawMatrix(matrix);
  }

  /**
   * Checks compatibility of firmware loaded on LED Matrix Module
   * @returns {Promise<boolean>} 
   */
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

  /**
   * Queries display module for version string
   * @returns {Promise<{major: number, minor: number}>}
   */
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
