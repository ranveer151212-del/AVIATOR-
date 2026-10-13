# Aviator History Lab (Expo + Firebase)

## Setup
1. Install Node.js LTS.
2. Run `npm install`.
3. Create a Firebase project. Enable Authentication > Email/Password and create Firestore.
4. Firebase Web app configuration is set in `src/firebase.js`, including `appId`, Realtime Database URL, and measurement ID. The supplied `google-services.json` is also included and the Android package name is `com.store`.
5. In Firebase Console, enable Authentication > Email/Password and create Firestore.
6. Publish `firestore.rules` in Firebase Console > Firestore > Rules.
7. Install dependencies with `npm install`.
8. Build and run a native Android development app with `npx expo run:android`, or build one using EAS (commands below). Do not use Expo Go for native Firebase Analytics.

## Native Android Firebase Analytics
- Added `@react-native-firebase/app` and `@react-native-firebase/analytics`.
- Added Expo config plugins in `app.json` and kept `google-services.json` at the project root.
- `src/analytics.js` logs `app_open` and `dashboard_viewed` events.
- After changing native dependencies, rebuild the native app; a JavaScript reload alone is not enough.

Local Android build (requires Android Studio/SDK configured):
```bash
npm install
npx expo prebuild
npx expo run:android
```

EAS development APK build (requires EAS login/configuration):
```bash
npx eas-cli build:configure
npx eas-cli build --platform android --profile development
```

To verify events, install and open the built app, then check Firebase Console > Analytics > DebugView. Analytics reporting may take time. Make sure the Firebase Android app registered in the console uses package name `com.store` and the included `google-services.json` belongs to that app.

## Optional historical API
Set `EXPO_PUBLIC_HISTORY_API_URL` to an HTTPS endpoint you control. It should return one of:
- `[1.1, 2.3, 1.02]`
- `{"results":[1.1,2.3]}`
- `{"data":[{"multiplier":1.1},{"multiplier":2.3}]}`

Only import data you are authorized to access. This is not an official game API and cannot know future rounds.

## Admin
Register a user first. In Firebase Console > Firestore, open `users/{uid}` and change `role` to `admin` for a trusted account. Never add client-side admin promotion. Production apps should use Firebase Admin SDK/custom claims.

## Files
- `App.js`: login/register, dashboard, manual historical values, admin overview
- `src/firebase.js`: Firebase JS SDK setup for auth/Firestore
- `src/analytics.js`: native Firebase Analytics events
- `src/auth.js`: authentication/profile
- `src/analysis.js`: historical statistics
- `src/api.js`: configurable API import
- `firestore.rules`: database security rules

Historical mean, median and frequency describe old results only. They are not a forecast or guarantee for the next multiplier.
