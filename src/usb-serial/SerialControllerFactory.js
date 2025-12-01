import { PortMutex } from './environments/web/PortMutex.js';
import { PortOperations } from './environments/web/PortOperations.js';
import { close, getPort } from './environments/web/port.js';
import { DefaultController } from './firmware/framework-official/DefaultController.js';
import { SigrootController } from './firmware/sigroot/SigrootController.js';

export class SerialControllerFactory {
  static async make(firmware) {
    const port = await getPort();
    if (port) {
      if (firmware === 'framework-official') {
        return await SerialControllerFactory.makeDefaultController(port);
      } else if (firmware === 'sigroot') {
        return await SerialControllerFactory.makeSigrootController(port);
      } else if (firmware === 'detect') {
        return await SerialControllerFactory.makeDetectedController(port);
      } else {
        throw new Error(`Unsupported firmware type: ${firmware}`);
      }
    }
  }

  static async makeDefaultController(port) {
    if (port?.connected) {
      await close(port);
      await port.open({ baudRate: 115200 });
      return new DefaultController(
        new PortMutex(
          new PortOperations(port)
        )
      );
    }
  }

  static async makeSigrootController(port) {
    if (port?.connected) {
      await close(port);
      await port.open({ baudRate: 115200 });
      return new SigrootController(
        new PortMutex(
          new PortOperations(port)
        )
      );
    }
  }

  static async makeDetectedController(port) {
    const ctrl1 = await this.makeDefaultController(port);
    if (await ctrl1.verifyFirmware()) {
      return ctrl1;
    }
    const ctrl2 = await this.makeSigrootController(port);
    if (await ctrl2.verifyFirmware()) {
      return ctrl2;
    }
  }
}
