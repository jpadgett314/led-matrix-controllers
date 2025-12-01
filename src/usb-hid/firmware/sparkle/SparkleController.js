import { GAMMA, HEIGHT, WIDTH } from '../../../hardware-constants.js';
import { Reports } from './reports.js';

export class SparkleController {
  constructor(hidOps) {
    this.#hidOps = hidOps;
  }

  async verifyFirmware() {
    try {
      const info = await this.info();
      return (
        info.display_height == HEIGHT &&
        info.display_width == WIDTH
      );
    } catch {
      return false;
    }
  }

  async version() {
    // Not Available
    return { major: 1, minor: 0 };
  }

  async draw(matrix) {
    return await this.#hidOps.send(
      Reports.GLITTER_GRID_PWM_CNTL,
      matrix.flat().map(v => GAMMA[Math.floor((v ?? 0) * 255)])
    );
  }

  // --- firmware-specific ---

  async info() {
    const infoRaw = await this.#hidOps.receive(Reports.GLITTER_DEVICE_INFO);

    // Mapping bytes based on your struct
    const info = {
      sleep_pin: infoRaw.getUint8(1),
      dip1_pin: infoRaw.getUint8(2),
      intb_pin: infoRaw.getUint8(3),
      state_flags: infoRaw.getUint8(4),
      id_reg: infoRaw.getUint8(5),
      config_reg: infoRaw.getUint8(6),
      global_brightness: infoRaw.getUint8(7),
      display_width: infoRaw.getUint8(8),
      display_height: infoRaw.getUint8(9),
      timeout_ms: infoRaw.getUint32(10),
      // version_major: infoRaw.getUint8(14),
      // version_minor: infoRaw.getUint8(15)
    };

    return info;
  }

  #hidOps;
}
