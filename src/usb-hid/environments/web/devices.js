import { PID, VID } from '../../../hardware-constants.js';

const extraDevices = [];

const filters = [
  {
    vendorId: VID,
    productId: PID,
  }
]

export class DeviceSelectionCancelled extends Error {
  constructor() {
    super('User cancelled device selection.');
    this.name = this.constructor.name;
    this.date = new Date();
  }
}

export async function getDevice() {
  if (extraDevices && extraDevices.length > 0) {
    return extraDevices.pop();
  }

  extraDevices.push(...(await navigator.hid.getDevices()));
  if (extraDevices && extraDevices.length > 0) {
    return extraDevices.pop();
  }

  extraDevices.push(...(await navigator.hid.requestDevice({ filters })));
  if (extraDevices && extraDevices.length > 0) {
    return extraDevices.pop();
  }

  throw new DeviceSelectionCancelled();
}
