import { GAMMA } from '../../../hardware-constants.js';
import { Commands, Reports } from './reports.js';

export class ReportAbstractionLayer {
  constructor(device = null) {
    this.device = device;
  }

  async info() {
    const infoRaw = await this.device.request(Reports.GLITTER_DEVICE_INFO);

    return {
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
      version_major: infoRaw.getUint8(14),
      version_minor: infoRaw.getUint8(15),
    };
  }

  async wake() {
    await this.device.send(
      Reports.GLITTER_BASIC_CMD,
      [Commands.GLITTER_CMD_SLEEP, false]
    );
  }

  async sleep() {
    await this.device.send(
      Reports.GLITTER_BASIC_CMD,
      [Commands.GLITTER_CMD_SLEEP, true]
    );
  }

  async disableSleep() {
    await this.device.send(
      Reports.GLITTER_BASIC_CMD, 
      [Commands.GLITTER_CMD_SET_SLEEP_TIMEOUT, 0xff, 0xff, 0xff, 0xff]
    );
  }

  async disableDeepSleep() {
    await this.device.send(
      Reports.GLITTER_BASIC_CMD, 
      [Commands.GLITTER_CMD_WAKE_ON_COMMAND, 0x01]
    );
  }

  async disableSleepTimer() {
    await this.device.send(
      Reports.GLITTER_BASIC_CMD, 
      [Commands.GLITTER_CMD_SET_SLEEP_TIMEOUT, 0x00, 0x00, 0x00, 0x00]
    );
  }
  
  async enableDeepSleep() {
    await this.device.send(
      Reports.GLITTER_BASIC_CMD, 
      [Commands.GLITTER_CMD_WAKE_ON_COMMAND, 0x00]
    );
  }

  async enableSleepTimer(milliseconds) {
    const view = new DataView(new ArrayBuffer(4));
    const littleEndian = false;
    view.setInt32(0, milliseconds, littleEndian);
    await this.device.send(
      Reports.GLITTER_BASIC_CMD, 
      [
        Commands.GLITTER_CMD_SET_SLEEP_TIMEOUT, 
        view.getUint8(0), 
        view.getUint8(1), 
        view.getUint8(2), 
        view.getUint8(3),
      ]
    );
  }

  async reboot(mode) {
    await this.device.send(
      Reports.GLITTER_BASIC_CMD, 
      [Commands.GLITTER_CMD_REBOOT, mode]
    );
  }

  async drawMatrix(matrix) {
    await this.device.send(
      Reports.GLITTER_GRID_PWM_CNTL,
      matrix.flat().map(v => GAMMA[Math.floor((v ?? 0) * 255)])
    );
  }

  async drawPixel(r, c, brightness) {
    await this.device.send(
      Reports.GLITTER_BASIC_CMD,
      [Commands.GLITTER_CMD_DRAW_PIXEL, c, r, brightness]
    );
  }

  async drawLine({r1, c1}, {r2, c2}, brightness) {
    await this.device.send(
      Reports.GLITTER_BASIC_CMD,
      [Commands.GLITTER_CMD_DRAW_PIXEL, r1, c1, r2, c2, brightness]
    );
  }

  device;
}
