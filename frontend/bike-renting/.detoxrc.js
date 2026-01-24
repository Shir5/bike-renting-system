/** @type {Detox.DetoxConfig} */
export const testRunner = {
  args: {
    $0: "jest",
    config: "e2e/jest.config.js",
  },
  jest: {
    setupTimeout: 120000,
  },
};
export const apps = {
  "ios.debug": {
    type: "ios.app",
    binaryPath:
      "ios/build/Build/Products/Debug-iphonesimulator/bikerenting.app",
    build:
      "xcodebuild -workspace ios/bikerenting.xcworkspace -scheme bikerenting -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
  },
  "android.debug": {
    type: "android.apk",
    binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
    build:
      "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..",
  },
};
export const devices = {
  simulator: { type: "ios.simulator", device: { type: "iPhone 15" } },
  emulator: {
    type: "android.emulator",
    device: { avdName: "Pixel_6_API_34" },
  },
};
export const configurations = {
  "ios.sim.debug": { device: "simulator", app: "ios.debug" },
  "android.emu.debug": { device: "emulator", app: "android.debug" },
};
