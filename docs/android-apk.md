# Android APK

Inventorie ships as a Vue 3 PWA for the browser and as a standalone Android APK through Capacitor. The APK loads the built Vite app from local Android assets, so the mock users, inventory seed data, recipes, ingredients, sample receipts, and OCR assets are packaged with the app.

## Requirements

- Node `^22.18.0 || >=24.12.0`
- JDK 21, or Android Studio's bundled Java runtime when it provides Java 21
- Android Studio or command-line Android SDK with platform tools, API 35, and build tools
- Android device or emulator
- Android WebView available on the device

## Build Flow

1. `npm install`
2. `npm run android:apk:debug`
3. Install `android/app/build/outputs/apk/debug/app-debug.apk` on a test phone.

The `android:apk:debug` script prepares local OCR files, builds the web app, syncs `dist/` into `android/app/src/main/assets/public`, and runs Gradle `assembleDebug`.

## Offline Behavior

- Mock data is compiled into the web bundle and is available on first launch without a server.
- User-created inventory, scan records, edited items, and preferences persist in the Android WebView through IndexedDB, with localStorage fallback.
- Tesseract worker, Tesseract core WASM, and uncompressed English language data are copied from installed npm packages into `public/ocr/tesseract` before build, then bundled into the APK.
- The OCR scanner points to local `/ocr/tesseract` assets so receipt scanning can run without first downloading data from a CDN.

## Phone Testing Checklist

- Install the APK on a physical Android phone.
- Turn on airplane mode before first launch.
- Confirm login, inventory, recipes, manual item add/edit, recipe suggestions, and receipt scanning work.
- Force-close and reopen the app to confirm stored inventory and scan data persist.
- Clear app storage and reopen to confirm bundled seed data returns.
