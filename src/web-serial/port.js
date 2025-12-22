import { PID, VID } from '../hardware-constants.js';

const filters = [{ usbVendorId: VID, usbProductId: PID }];

export class PortSelectionCancelled extends Error {
  constructor() {
    super('User cancelled port selection.');
    this.name = this.constructor.name;
    this.date = new Date();
  }
}

export class PortUnavailable extends Error {
  constructor() {
    super('Selected port already in use.');
    this.name = this.constructor.name;
    this.date = new Date();
  }
}

async function requestPort() {
  try {
    if (navigator.serial.requestPort) {
      return Object.assign(
        await navigator.serial.requestPort({ filters }),
        { pickedByUser: true }
      );
    } else {
      return null; // Web Worker
    }
  } catch (e) {
    switch (e.name) {
      case ('NotFoundError'):
        throw new PortSelectionCancelled();
      case ('InvalidStateError'):
        throw new PortUnavailable();
      case ('SecurityError'): // No user gesture
        return null;
      default:
        throw e;
    }
  }
}

class KnownPorts {
  used = new Set();
  unused = [];

  async getOrFetchUnused() {
    let port = this.unused.pop();
    
    if (!port) {
      const knownPorts = await navigator.serial.getPorts({ filters });
      this.#enqueueUnique(knownPorts);
      port = this.unused.pop();
    }

    if (!port) {
      const manualPort = await requestPort();
      this.#enqueueUnique([manualPort]);
      port = this.unused.pop();
    }

    if (port) {
      this.used.add(port);
    }
    
    return port;
  }

  #enqueueUnique(ports) {
    if (ports) {
      for (const port of ports) {
        if (port && !this.used.has(port) && !this.unused.includes(port)) {
          this.unused.push(port);
        }
      }
    }
  }
}

const knownPorts = new KnownPorts();

/**
 * Adds user-selected port to permitted ports. Only for use outside of Web 
 * Worker to establish permission for use within Web Worker.
 * @returns {null}
 */
export async function requestPortForWorker() {
  const _ = await requestPort();
}

/**
 * Never returns the same port twice. 
 * @returns {(SerialPort|null)}
 */
export async function getUnusedPort() {
  return await knownPorts.getOrFetchUnused();
}

/**
 * Close port without throwing if already closed.
 * @param {SerialPort} port 
 */
export async function close(port) {
  try {
    await port.close();
  } catch(e) {
    if (e.name != 'InvalidStateError') {
      if (e.message.includes('The port is already closed')) {
        throw e;
      }
    }
  }
}
