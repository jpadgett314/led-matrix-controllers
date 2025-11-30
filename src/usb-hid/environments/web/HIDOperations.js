import { pad } from './util.js';

export class HIDOperations {
  constructor(device) {
    this.#device = device;
  }

  async send(report, data) {
    if (data.length < report.bytes) {
      data = pad(data, report.bytes);
    } else if (data.length > report.bytes) {
      throw new Error('Unable to send report: too many bytes');
    }

    const buffer = new Uint8Array(data).buffer;

    if (report.feature)  {
      await this.#device.sendFeatureReport(report.id, buffer);
    } else {
      await this.#device.sendReport(report.buffer);
    }
  }

  async receive(report) {
    let reply = [];

    if (report.feature) {
      reply = await this.#device.receiveFeatureReport(report.id);
    } else {
      /* 
       * HID input reports are used for unprompted data.
       * An event system must be used.
       * See WebHID `HIDInputReportEvent`
       */
      throw new Error('Invalid operation');
    }

    if (reply.byteLength != report.bytes) {
      console.error(`reply length=${reply.length} (exp ${report.bytes})`);
    }

    return reply;
  }

  #device;
}
