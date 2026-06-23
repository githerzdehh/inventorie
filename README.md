# Inventorie

Inventorie is a local-first grocery inventory, receipt scanning, and recipe suggestion prototype. It is built as a Vue 3 PWA and packaged for Android through Capacitor, so the same application can run in the browser or inside a native Android WebView.

This project is a working prototype for a student request made by Creatizan.

Developer: 2ez4DevHD

## What Inventorie Does

Inventorie helps a user turn grocery source images into a usable food inventory. A user can scan or upload a receipt/grocery image, review detected items, save selected items into a pantry, track freshness, and use the available pantry ingredients to find matching recipes.

The prototype is intentionally local-first. Mock users, seed pantry data, ingredients, recipes, notifications, sample scans, and plan data are bundled with the app. User-created pantry records, scan history, preferences, support drafts, and session data are persisted in browser storage.

## Prototype Scope

- Frontend prototype with mocked/local data, not a production backend service.
- Browser PWA support through Vite PWA.
- Android APK support through Capacitor.
- Offline OCR assets prepared from installed Tesseract packages and bundled into the web/native build.
- IndexedDB persistence through Dexie with localStorage fallback.
- Role-based prototype access for Super Admin, Admin, and Subscriber accounts.
- Demo subscription, support, comparison, and notification flows are local UI/state features.

## Core Features

### Authentication And Roles

- Login and registration screens.
- Seeded demo users for Super Admin, Admin, and Subscriber roles.
- Local session persistence.
- Registration is disabled by default and can be enabled by Super Admin.
- Philippine phone number validation for user records.
- Route guards protect authenticated app pages.
- Super Admin-only access for user management and test data reset screens.

### User Management

- Create users with role and subscription status.
- Edit existing user profile fields, passwords, roles, and subscription flags.
- Delete user accounts when allowed by the current role rules.
- Toggle public registration.
- View the allowed phone country setting.
- Reset seeded test data from a Super Admin-only developer screen.

### Scanner And OCR Flow

- Capture or upload a grocery/receipt image.
- Preview the selected source image before processing.
- Resize and prepare the image for OCR.
- Run Tesseract-based OCR using local worker, core WASM, and English language data.
- Parse OCR text into detected grocery items.
- Review detected items before saving.
- Select, edit, add, remove, or skip detected items.
- Save selected items into the pantry.
- Super Admin diagnostics include OCR confidence, raw scan text, scanner progress, and debug events.
- Sample scan support is available for Super Admin testing.

### Scan History

- Persist scan records separately from pantry items.
- Store scan code, alias, note, input method, original file name, source preview metadata, status, OCR confidence, item count, saved item count, and timestamps.
- Edit scan aliases and notes.
- Link pantry items back to the scan record that created them.

### Pantry Inventory

- View all pantry items in a mobile-first inventory screen.
- Search pantry items.
- Sort by recently added, expiring soon, needs restocking, or A-Z.
- Add manual pantry items.
- Save scanned items from the review flow.
- Edit item name, description, quantity, unit, storage location, and use-by date.
- Delete pantry items.
- Track pantry, refrigerator, and freezer locations.
- Show freshness states such as fresh, use soon, expiring today, past suggested date, and unknown.
- Preserve provenance fields like scan code, scan input method, scan time, raw scan label, and original file name.

### Recipe Suggestions

- Bundled recipe catalog with offline recipe data.
- Match recipes against available pantry ingredient IDs.
- Show recipes that can be cooked now and recipes with missing ingredients.
- Open recipe detail pages with ingredients, preparation steps, estimated time, tags, and saved status.
- Save and unsave recipes.
- View saved recipes in a dedicated page.

### Home, Profile, And Social Comparison

- Home dashboard for inventory and recipe-oriented summaries.
- Profile page backed by the active local user session.
- Friend comparison prototype with local comparison stats.
- Preference to pause comparison behavior.

### Notifications

- Local notification list with pantry, recipe, comparison, and system notification types.
- Unread count support.
- Mark individual notifications as read.
- Mark all notifications as read.
- Notification state persists in localStorage.

### Settings And Preferences

- Settings hub for account, plan, support, language, currency, terms, privacy, and Super Admin tools.
- Language preference storage.
- Currency preference storage.
- Data sharing consent preference.
- Delete-account dialog for allowed non-Super Admin accounts.
- Terms and privacy pages that explain local prototype data handling.

### Plan And Support Prototype

- Local plan comparison between Basic and Unbasic plan options.
- Plan selection stored as a local preference.
- Support form with topic, contact details, and message.
- Support submissions are stored locally and limited to recent entries.

### PWA And Android Wrapper

- Vite PWA manifest for standalone browser installation.
- Capacitor Android project under `android/`.
- Android app ID: `com.creatizan.inventorie`.
- Android app name: `Inventorie`.
- Web build output is synced from `dist/` into Android assets.
- Android debug APK build script is available through the package scripts.
- See `docs/android-apk.md` for Android requirements and phone testing notes.

## Demo Accounts

These accounts are mock users stored locally for prototype testing.

| Role | Username | Password | Notes |
| --- | --- | --- | --- |
| Super Admin | `superadmin` | `super123` | Full prototype access, diagnostics, user management, registration toggle, reset data |
| Admin | `admin` | `admin123` | Admin-level app access without Super Admin-only screens |
| Subscriber | `diane` | `diane123` | Subscribed user account |
| Subscriber | `jasmine` | `jasmine123` | Subscribed user account |
| Subscriber | `miguel` | `miguel123` | Unsubscribed user account |
| Subscriber | `aria` | `aria123` | Subscribed user account |
| Subscriber | `noah` | `noah123` | Unsubscribed user account |

## Application Routes

Public routes:

- `/login`
- `/register`

Authenticated routes:

- `/app/home`
- `/app/friends/compare`
- `/app/profile`
- `/app/scan`
- `/app/review-items`
- `/app/scans`
- `/app/pantry`
- `/app/pantry/:id`
- `/app/cook`
- `/app/recipes/:id`
- `/app/saved`
- `/app/notifications`
- `/app/plan`
- `/app/support`
- `/app/settings`
- `/app/settings/terms`
- `/app/settings/privacy`
- `/app/settings/language`
- `/app/settings/currency`
- `/app/users`
- `/app/dev/reset-data`

## Data And Storage Model

Inventorie does not depend on a remote API in this prototype.

- Auth users, registration config, and session data are stored in localStorage.
- App preferences, plan selection, comparison setting, and support submissions are stored in localStorage.
- Notifications are stored in localStorage.
- Pantry items and scan records use Dexie/IndexedDB when available.
- Pantry and scan storage fall back to localStorage if IndexedDB is unavailable.
- Mock ingredients, storage rules, recipes, sample receipts, pantry seed data, comparison profiles, notifications, plans, languages, currencies, and support topics are bundled in `src/mocks/data/`.

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Vuetify
- Vite PWA
- Dexie / IndexedDB
- Tesseract.js
- OpenCV.js image preparation
- Capacitor Android
- Vitest and Vue Testing Library
- Playwright test tooling

## Project Structure

```text
android/                  Capacitor Android native wrapper
docs/android-apk.md       Android APK build and phone testing notes
public/icons/             PWA icon assets
scripts/                  Build helper scripts
src/assets/               Global styles, logos, and favicon assets
src/components/           Shared UI, scanner, and pantry components
src/composables/          OCR, parsing, storage, date, quantity, and utility logic
src/layouts/              Public and authenticated app layouts
src/mocks/data/           Local prototype seed data
src/plugins/              Vuetify setup
src/router/               Route definitions and access guards
src/stores/               Pinia state stores
src/views/                Route-level screens
```

## Requirements

- Node `^22.18.0 || >=24.12.0`
- npm
- For Android builds: JDK 21 or Android Studio's bundled compatible runtime
- For Android builds: Android Studio or Android SDK platform tools, API 35, and build tools

## Setup

```sh
npm install
```

## Web Development

```sh
npm run dev
```

Build the web app:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Android Development

Sync the web build into Android:

```sh
npm run android:sync
```

Open the Android project:

```sh
npm run android:open
```

Build a debug APK:

```sh
npm run android:apk:debug
```

The debug APK is generated at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## OCR Asset Preparation

The production build runs:

```sh
npm run prepare:ocr
```

That script copies Tesseract worker files, Tesseract core WASM files, and English trained data from installed npm packages into `public/ocr/tesseract`. The generated OCR files are ignored by Git because they are build artifacts.

## Testing Commands

Unit tests:

```sh
npm run test:unit
```

End-to-end tests:

```sh
npm run test:e2e
```

Type checking:

```sh
npm run type-check
```

## Current Prototype Notes

- This is a working prototype, not a production deployment.
- User accounts and passwords are mock local records.
- Pantry, scans, preferences, notifications, and support submissions live on the current device/browser.
- Clearing browser storage or Android app storage resets local user-created data.
- OCR quality depends on image clarity, contrast, and receipt/source formatting.
- The Android wrapper packages the built web app and local OCR assets into a native APK, but the app logic remains the Vue/Vite application.
