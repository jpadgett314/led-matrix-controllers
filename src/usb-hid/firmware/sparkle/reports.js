export const Reports = {
  GLITTER_DEVICE_INFO: {
    id: 0x01,
    bytes: 32,
    feature: true,
  },
  GLITTER_BASIC_CMD: {
    id: 0x02,
    bytes: 16,
    feature: true,
  },
  GLITTER_GRID_PWM_CNTL: {
    id: 0x03,
    bytes: 306,
    feature: true,
  },
  GLITTER_GRID_PWM_CNTL: {
    id: 0x04,
    bytes: 306,
    feature: true,
  }
}

export const Commands = {
  GLITTER_CMD_REBOOT: 0x00,
  GLITTER_CMD_SLEEP: 0x01,
  GLITTER_CMD_WAKE_ON_COMMAND: 0x02,
  GLITTER_CMD_SET_SLEEP_TIMEOUT: 0x03,
  GLITTER_CMD_SET_GLOBAL_BRIGHTNESS: 0x04,
  GLITTER_CMD_DRAW_PIXEL: 0x05,
  GLITTER_CMD_DRAW_LINE: 0x06
}
