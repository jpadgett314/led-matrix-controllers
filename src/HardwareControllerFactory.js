import { DefaultController } from './supported-firmware/FrameworkComputer/inputmodule-rs/DefaultController.js';
import { SigrootController } from './supported-firmware/sigroot/FW_LED_Matrix_Firmware/SigrootController.js';
import { SparkleController } from './supported-firmware/vddCore/sparkle-fw16/SparkleController.js';

export class HardwareControllerFactory {
  static async detectSerial() {
    const c1 = new DefaultController();
    const c2 = new SigrootController();

    await c1.connect();
    if (await c1.verifyFirmware()) {
      return c1;
    }
    
    await c2.connect();
    if (await c2.verifyFirmware()) {
      return c2;
    } 
    
    return null;
  }

  static async detectHID() {
    const c1 = new SparkleController();

    await c1.connect();
    if (await c1.verifyFirmware()) {
      return c1;
    } 
    
    return null;
  }
}
