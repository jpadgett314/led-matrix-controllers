# LED Matrix Controllers

Cross-firmware controllers for the [Framework Laptop 16 LED matrix module](https://frame.work/products/16-led-matrix) using WebHID and Web Serial APIs

## Supported Firmwares

- [FrameworkComputer/inputmodule-rs](https://github.com/FrameworkComputer/inputmodule-rs) (Out-of-box default)
- [vddCore/sparkle-fw16](https://github.com/vddCore/sparkle-fw16)
- [sigroot/FW_LED_Matrix_Firmware](https://github.com/sigroot/FW_LED_Matrix_Firmware)

If you maintain another firmware or a fork, please open an issue or submit a PR!

## Quick Start

### Installation

#### Node.js

```bash
npm install led-matrix-controllers
```

#### CDN

```html
<script type="importmap">
    {
        "imports": {
            "led-matrix-controllers": "https://esm.sh/led-matrix-controllers@latest"
        }
    }
</script>
```

### Usage

#### For specific firmware

```js
// Controllers for specific firmware
import { DefaultController, SigrootController, SparkleController } from 'led-matrix-controllers';

const controller = new DefaultController();
await controller.connect();
await controller.draw( /* 34x9 array of arrays of 0 to 1.0 */ );
```

#### For specific interface

```js
import { HardwareControllerFactory } from 'led-matrix-controllers';

// connect to device
const serialController = await HardwareControllerFactory.detectSerial();
const hidController = await HardwareControllerFactory.detectHID();
```

## Development

### Prerequisites

* **Node.js** (v18 or later)

### Installation

Setup development environment

```bash
npm install
```

Bundle (for locally testing minified/non-ESM builds)

```bash
npm run build
```

Lint

```
npm run lint
```

Lint & Fix

```
npm run lint:fix
```
