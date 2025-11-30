import { getDevice } from './environments/web/devices.js';
import { HIDOperations } from './environments/web/HIDOperations.js';
import { SparkleController } from './firmware/sparkle';

export class HIDControllerFactory {
  static async make(environment, firmware) {
    if (environment === 'web') {
      const device = await getDevice();
      if (device) {
        if (firmware === 'sparkle') {
          return await HIDControllerFactory.makeSparkleController(device);
        } else {
          throw new Error(`Unsupported firmware type: ${firmware}`);
        }
      } else {
        return null;
      }
    } else {
      throw new Error(`Unsupported environment: ${environment}`);
    }
  }

  static async makeSparkleController(device) {
    if (device) {
      await device.open();
      return new SparkleController(
        new HIDOperations(device)
      );
    }
  }
}
