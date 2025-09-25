# capacitor-airbridge

🌉 **Complete Capacitor plugin for Airbridge SDK integration** - Full API coverage with 100% TypeScript support.

[![npm version](https://badge.fury.io/js/capacitor-airbridge.svg)](https://badge.fury.io/js/capacitor-airbridge)
[![Coverage: 100%](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/esc5221/capacitor-airbridge)
[![Tests: 63 passed](https://img.shields.io/badge/tests-63%20passed-brightgreen.svg)](https://github.com/esc5221/capacitor-airbridge)

## ✨ Features

- 🎯 **Complete API Coverage**: All Airbridge SDK v4+ methods implemented
- 📱 **Cross-Platform**: iOS, Android, and Web support
- 🔗 **Advanced Deep Linking**: Handle regular, deferred, and tracked deep links
- 👤 **Full User Management**: Individual user methods + bulk operations
- 📊 **Event Tracking**: Standard and custom event tracking with attributes
- 🛠️ **SDK Control**: Enable/disable, start/stop tracking capabilities
- 🔧 **Utility Functions**: Tracking link creation, UUID generation
- 💯 **TypeScript**: Full type safety with IntelliSense support
- ✅ **100% Test Coverage**: Comprehensive test suite with 63 tests

## 🚀 Installation

### NPM Installation

```bash
npm install capacitor-airbridge
npx cap sync
```

### Package Manager Support

**CocoaPods** (Default)
```bash
npx cap add ios
```

**Swift Package Manager** (Capacitor 6+)
```bash
npx cap add ios --packagemanager SPM
```

For existing projects, migrate to SPM:
```bash
npx cap spm-migration-assistant
```

## 📋 API Reference

### Initialization Options

Common
- `appName: string` (required)
- `appToken: string` (required)
- `isHandleAirbridgeDeeplinkOnly?: boolean`
- `autoStartTrackingEnabled?: boolean` (default true)
- `trackingLinkCustomDomains?: string[]`
- `sdkEnabled?: boolean` (default true) — initialize SDK enabled/disabled (both iOS/Android)

Android-specific
- `trackInSessionLifecycleEventEnabled?: boolean`
- `sessionTimeoutSecond?: number` (default 300)
- `eventTransmitIntervalMs?: number` (default 0)
- `logLevel?: 'DEBUG'|'INFO'|'WARN'|'ERROR'|'FAULT'`

iOS-specific
- `autoDetermineTrackingAuthorizationTimeoutInSecond?: number`

### Core Methods

| Method | Description |
|--------|-------------|
| `initialize()` | Initialize SDK with app credentials |
| `trackEvent()` | Track user events with attributes |
| `setUser()` | Set complete user information |

### User Management

| Method | Description |
|--------|-------------|
| `clearUser()` | Clear all user data |
| `setUserID()` | Set individual user ID |
| `setUserEmail()` | Set individual user email |
| `setUserPhone()` | Set individual user phone |
| `setUserAlias()` | Set user alias with key-value |
| `setUserAttribute()` | Set individual user attribute |

### Device Management

| Method | Description |
|--------|-------------|
| `setDeviceAlias()` | Set device alias |
| `removeDeviceAlias()` | Remove specific device alias |
| `clearDeviceAlias()` | Clear all device aliases |

### Deep Link Handling

| Method | Description |
|--------|-------------|
| `setOnDeeplinkReceived()` | Set deep link listener |
| `clearDeeplinkListener()` | Clear deep link listener |
| `handleDeeplink()` | Handle deep link manually |
| `handleDeferredDeeplink()` | Handle deferred deep links |
| `trackDeeplink()` | Track deep link with parameters |

### SDK Control

| Method | Description |
|--------|-------------|
| `startTracking()` | Start tracking after opt-in |
| `stopTracking()` | Stop all tracking activities |
| `enableSDK()` | Enable SDK functionality |
| `disableSDK()` | Disable SDK functionality |

### Utilities

| Method | Description |
|--------|-------------|
| `createTrackingLink()` | Create dynamic tracking links |
| `fetchAirbridgeGeneratedUUID()` | Get SDK-generated UUID |

## 💡 Usage Examples

### Basic Setup

```typescript
import { Airbridge, AirbridgeCategory, AirbridgeAttribute } from 'capacitor-airbridge';

// Initialize SDK
await Airbridge.initialize({
  appName: 'your-app-name',
  appToken: 'your-app-token',
  isHandleAirbridgeDeeplinkOnly: true
});
```

### Event Tracking (Standard + Custom)

```typescript
// Simple event
await Airbridge.trackEvent({
  category: AirbridgeCategory.SIGNIN
});

// Standard event with action/label/value (report-visible)
await Airbridge.trackEvent({
  category: AirbridgeCategory.SIGNUP,
  action: 'oauth',       // shows as Event Action
  label: 'google',       // shows as Event Label
  value: 0,              // shows as Value (float)
  customAttributes: { referrer: 'google' }
});

// E-commerce event with semantic + custom attributes
await Airbridge.trackEvent({
  category: AirbridgeCategory.ORDER_COMPLETE,
  semanticAttributes: {
    [AirbridgeAttribute.VALUE]: 299.99,
    [AirbridgeAttribute.CURRENCY]: 'USD',
    [AirbridgeAttribute.TRANSACTION_ID]: 'order-123',
    [AirbridgeAttribute.PRODUCTS]: [
      {
        [AirbridgeAttribute.PRODUCT_ID]: 'prod-456',
        [AirbridgeAttribute.PRODUCT_NAME]: 'Premium Widget',
        [AirbridgeAttribute.PRODUCT_PRICE]: 99.99,
        [AirbridgeAttribute.PRODUCT_QUANTITY]: 3
      }
    ]
  },
  customAttributes: {
    'campaign': 'black-friday',
    'platform': 'mobile'
  }
});

// Custom event (snake_case, cannot start with `airbridge.`)
await Airbridge.trackEvent({
  category: 'solver_problem_submitted',
  action: 'algebra',
  label: 'task_123',
  customAttributes: { task_id: 'task_123', solver_type: 'algebra' }
});
```

### User Management

```typescript
// Set complete user profile
await Airbridge.setUser({
  id: 'user-123',
  email: 'user@example.com',
  phone: '+1234567890',
  attributes: {
    'plan': 'premium',
    'age': 28,
    'registration_date': '2024-01-15'
  }
});

// Set individual user properties
await Airbridge.setUserID({ id: 'user-456' });
await Airbridge.setUserEmail({ email: 'new@example.com' });
await Airbridge.setUserAlias({ key: 'facebook_id', value: 'fb_12345' });

// Clear user data (e.g., on logout)
await Airbridge.clearUser();
```

### Deep Link Handling

```typescript
// Set up deep link listener
await Airbridge.setOnDeeplinkReceived({
  callbackId: 'deeplink-handler'
});

// Listen for deep links
import { PluginListenerHandle } from '@capacitor/core';

const listener: PluginListenerHandle = Airbridge.addListener(
  'deeplink-handler',
  (data: { url: string }) => {
    console.log('Deep link received:', data.url);

    // Parse and handle the deep link
    if (data.url.includes('/product/')) {
      const productId = data.url.split('/product/')[1];
      navigateToProduct(productId);
    }
  }
);

// Handle deferred deep links (for new installs)
await Airbridge.handleDeferredDeeplink({
  callbackId: 'deferred-deeplink',
  timeoutMillis: 5000
});

// Manual deep link handling
await Airbridge.handleDeeplink({
  url: 'https://yourapp.com/promo?code=SAVE20'
});

// Track deep link with custom parameters
await Airbridge.trackDeeplink({
  url: 'https://yourapp.com/share',
  parameters: {
    'source': 'social_share',
    'campaign': 'viral_marketing'
  }
});
```

### Tracking Link Creation

```typescript
// Create dynamic tracking link
const result = await Airbridge.createTrackingLink({
  channel: 'facebook',
  campaign: 'holiday-sale-2024',
  deeplink: 'myapp://product/special-offer',
  fallback: 'https://mystore.com/special-offer',
  parameters: {
    'utm_source': 'facebook',
    'utm_medium': 'social',
    'promo_code': 'HOLIDAY20'
  }
});

console.log('Tracking link:', result.url);
// Share this link in campaigns
```

### SDK Control & Privacy

```typescript
// Stop tracking (for privacy compliance)
await Airbridge.stopTracking();

// Re-enable tracking
await Airbridge.enableSDK();

// Disable SDK completely
await Airbridge.disableSDK();

// Get unique SDK identifier
const { uuid } = await Airbridge.fetchAirbridgeGeneratedUUID();
console.log('SDK UUID:', uuid);

// Opt-In flow example (Android/iOS)
await Airbridge.initialize({
  appName: 'your-app',
  appToken: 'token',
  autoStartTrackingEnabled: false
});
// After CMP consent
await Airbridge.startTracking();
```

### Device Management

```typescript
// Set device identifiers
await Airbridge.setDeviceAlias({
  key: 'custom_device_id',
  value: 'device-abc-123'
});

// Remove specific alias
await Airbridge.removeDeviceAlias({
  key: 'old_identifier'
});

// Clear all device aliases
await Airbridge.clearDeviceAlias();
```

## ⚙️ Configuration

### iOS Setup

1. **Add to Info.plist:**

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>your-app-scheme</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>your-app-scheme</string>
    </array>
  </dict>
</array>
```

2. **Handle URL schemes in AppDelegate.swift:**

```swift
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }
}
```

### Android Setup

1. **Add to AndroidManifest.xml:**

```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:launchMode="singleTask">

    <!-- Universal Link -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https"
              android:host="yourapp.airbridge.io" />
    </intent-filter>

    <!-- Custom Scheme -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="your-app-scheme" />
    </intent-filter>
</activity>
```

## 📝 TypeScript Definitions

### Main Interfaces

```typescript
interface AirbridgePlugin {
  // Core methods
  initialize(options: AirbridgeInitializeOptions): Promise<void>;
  trackEvent(options: AirbridgeTrackEventOptions): Promise<void>;

  // User management
  setUser(options: AirbridgeUserOptions): Promise<void>;
  clearUser(): Promise<void>;
  setUserID(options: AirbridgeUserIDOptions): Promise<void>;
  setUserEmail(options: AirbridgeUserEmailOptions): Promise<void>;

  // Deep links
  setOnDeeplinkReceived(options: AirbridgeDeeplinkOptions): Promise<void>;
  handleDeeplink(options: AirbridgeHandleDeeplinkOptions): Promise<void>;

  // Utilities
  createTrackingLink(options: AirbridgeCreateTrackingLinkOptions): Promise<AirbridgeTrackingLinkResult>;
  fetchAirbridgeGeneratedUUID(): Promise<AirbridgeUUIDResult>;

  // ... and 15+ more methods
}
```

### Standard Enums

```typescript
enum AirbridgeCategory {
  INSTALL = 'airbridge.user.install',
  OPEN = 'airbridge.user.open',
  SIGNUP = 'airbridge.user.signup',
  SIGNIN = 'airbridge.user.signin',
  ORDER_COMPLETE = 'airbridge.ecommerce.order.complete',
  // ... 20+ predefined categories
}

enum AirbridgeAttribute {
  VALUE = 'value',
  CURRENCY = 'currency',
  TRANSACTION_ID = 'transactionID',
  PRODUCTS = 'products',
  // ... 25+ predefined attributes
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📦 Build & Development

```bash
# Build plugin
npm run build

# Lint code
npm run lint

# Format code
npm run fmt
```

## 🔧 Example Usage

Check out the [example directory](https://github.com/esc5221/capacitor-airbridge/tree/main/example) for a complete implementation demo.

## 📊 Compatibility

- **Capacitor:** 6.0.0+
- **iOS:** 13.0+ (SPM: 12.0+)
- **Android:** API Level 22+ (Android 5.1+)
- **Node.js:** 16.0.0+
- **Package Managers:** CocoaPods, Swift Package Manager

## 🆘 Common Issues

### iOS Build Issues

**CocoaPods**
```bash
# Clean and reinstall pods
cd ios && pod install --repo-update
```

**Swift Package Manager**
```bash
# Reset package caches in Xcode
# File > Swift Packages > Reset Package Caches
# Or delete derived data and rebuild
```

### Android Build Issues

```bash
# Clean Gradle cache
cd android && ./gradlew clean
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [GPAI Team](mailto:dev@gpai.co)

## 🙋‍♂️ Support

- 📚 [Documentation](https://github.com/esc5221/capacitor-airbridge/wiki)
- 🐛 [Issue Tracker](https://github.com/esc5221/capacitor-airbridge/issues)
- 💬 [Discussions](https://github.com/esc5221/capacitor-airbridge/discussions)

---

**Made with ❤️ for the Capacitor community**
