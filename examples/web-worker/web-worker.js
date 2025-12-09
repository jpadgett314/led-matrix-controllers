// no importmap in Web Worker
import { DefaultController, HEIGHT, WIDTH } from 'https://esm.sh/led-matrix-controllers@latest';

console.log('Worker Created');

const controller1 = new DefaultController();

const controller2 = new DefaultController();

const p = Math.ceil(Math.random() * 3) + 1;

const q = Math.ceil(Math.random() * 3) + 1;

onmessage = async (e) => {
  switch (e.data) {
    case ('connect1'):
      await controller1.connect();
      break;

    case ('connect2'):
      await controller2.connect();
      break;

    case ('draw1'):
      await controller1.drawGrayscale(
        Array.from({ length: HEIGHT }, (_, i) =>
          Array.from({ length: WIDTH }, (_, j) =>
            (i % p != 0 ? 0.5 : 0) + (j % q != 0 ? 0.5 : 0)
          )
        ));
      break;

    case ('draw2'):
      await controller2.drawGrayscale(
        Array.from({ length: HEIGHT }, (_, i) =>
          Array.from({ length: WIDTH }, (_, j) =>
            (i % q != 0 ? 0.5 : 0) + (j % p != 0 ? 0.5 : 0)
          )
        ));
      break;
  }
}
