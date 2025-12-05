# LED Matrix Controllers

Cross-firmware controllers for the [Framework Laptop 16 LED matrix module](https://frame.work/products/16-led-matrix) using WebHID and Web Serial APIs

## Supported Firmwares

- https://github.com/FrameworkComputer/inputmodule-rs (Out-of-box default)
- https://github.com/vddCore/sparkle-fw16
- https://github.com/sigroot/FW_LED_Matrix_Firmware

If you maintain another firmware or a fork, please open an issue or submit a PR!

## Quick Start

### Installation

#### Browser

```html
<script type="module">
    import { DefaultController } from 'https://esm.sh/led-matrix-controllers@latest';
    const controller = new DefaultController();
    await controller.connect();
    // ...
</script>

```

#### Node.js

```bash
npm install led-matrix-controllers
```

Also see [examples/webpack/](examples/webpack/)

### Usage

#### For specific firmware

```js
// Controllers for specific firmware
import { DefaultController, SigrootController, SparkleController } from 'led-matrix-controllers';

const controller = new DefaultController();
await controller.connect();
await controller.draw( /* 34x9 matrix array */ );
```

Also see [examples/sparkle.html](examples/sparkle.html)

#### For specific interface

```js
import { HardwareControllerFactory } from 'led-matrix-controllers';

let controller = HardwareControllerFactory.detectSerial();
let controller = HardwareControllerFactory.detectHID();
```

Also see [examples/detect-firmware.html](examples/detect-firmware.html)

## Development

### Prerequisites

* **Node.js** (v16.9.0 or later recommended for corepack)

### Installation

Setup development environment

```bash
npm install -g corepack 
corepack enable
yarn set version stable
yarn install
```

Bundle (optional)

```bash
yarn build
```
