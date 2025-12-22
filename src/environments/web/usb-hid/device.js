import { PID, VID } from '../../../hardware-constants.js';

const filters = [{ vendorId: VID, productId: PID }];

export class DeviceSelectionCancelled extends Error {
  constructor() {
    super('User cancelled device selection.');
    this.name = this.constructor.name;
    this.date = new Date();
  }
}

async function requestDevice() {
  try {
    if (navigator.serial.requestPort) {
      return await navigator.serial.requestDevice({ filters });
    } else {
      return null; // Web Worker
    }
  } catch (e) {
    switch (e.name) {
      case ('NotFoundError'):
        throw new DeviceSelectionCancelled();
      case ('SecurityError'): // No user gesture
        return null;
      default:
        throw e;
    }
  }
}

class KnownDevices {
  used = new Set();
  unused = [];

  async getOrFetchUnused() {
    let device = this.unused.pop();

    if (!device) {
      const systemDevices = await navigator.hid.getDevices({ filters });
      this.#enqueueUnique(systemDevices);
      device = this.unused.pop();
    }

    if (!device) {
      const manualDevices = await requestDevice();
      this.#enqueueUnique([manualDevices]);
      device = this.unused.pop();
    }

    if (device) {
      this.used.add(device);
    }

    return device;
  }

  #enqueueUnique(devices) {
    if (devices) {
      for (const dev of devices) {
        if (dev && !this.used.has(dev) && !this.unused.includes(dev)) {
          this.unused.push(dev);
        }
      }
    }
  }
}

const knownDevices = new KnownDevices();

/**
 * Adds user-selected device to permitted device. Only for use outside of Web 
 * Worker to establish permission for use within Web Worker.
 * @returns {null}
 */
export async function reqestDeviceForWorker() {
  const _ = await requestDevice();
}

/**
 * Never returns the same device twice. 
 * @returns {(HIDDevice|null)}
 */
export async function getUnusedDevice() {
  return await knownDevices.getOrFetchUnused();
}
