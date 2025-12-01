import { getDevice } from './environments/web/device.js';
import { HIDOperations } from './environments/web/HIDOperations.js';
import { SparkleController } from './firmware/sparkle/SparkleController.js';

export class HIDControllerFactory {
  static async make(firmware) {
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
