# @fullstory/cordova-plugin

This plugin provides native integration with Fullstory in your Cordova app(s). It bundles the native Fullstory SDK for iOS and Android and exposes a small JavaScript API for controlling capture from within your app.

## Quick Links

- [Fullstory Help Center](https://help.fullstory.com/)
- [Email us](mailto:mobile-support@fullstory.com)

## Prerequisites

Native platform requirements:

- **iOS**: `cordova-ios` `>=6.0.0`
- **Android**: `cordova-android` `>=9.1.0`

## Installation

```sh
cordova plugin add @fullstory/cordova-plugin --variable FS_ORG=YOUR_ORG_ID
```

### Configuration variables

| Variable              | Platform | Default                 | Description                                                           |
| --------------------- | -------- | ----------------------- | --------------------------------------------------------------------- |
| `FS_ORG`              | Android  | —                       | Your Fullstory org ID. Required for capture to start on Android.      |
| `FS_VERSION`          | Both     | `1.73.2`                | Version of the native Fullstory SDK to install.                       |
| `FS_SERVER_URL`       | Android  | `https://fullstory.com` | Fullstory server URL to send data to.                                 |
| `FS_ENABLED_VARIANTS` | Android  | `release`               | Comma-separated list of Android build variants to enable capture for. |
| `FS_LOG_LEVEL`        | Android  | `info`                  | Native SDK log level.                                                 |
| `FS_RECORD_ON_START`  | Android  | `true`                  | Whether capture starts automatically when the app launches.           |

On iOS, org ID and other capture settings are configured in your app's own `config.xml`.

```xml
<platform name="ios">
    <config-file parent="Fullstory" target="*-Info.plist">
        <dict>
            <key>OrgId</key>
            <string>YOUR_ORG_ID</string>
        </dict>
    </config-file>
</platform>
```

### iOS

Run `cordova prepare ios` (or build the app) to install the `Fullstory` CocoaPod and apply the required build phase/scheme configuration automatically via the plugin's install hooks.

### Android

Run `cordova prepare android` (or build the app) to pull in the native Fullstory SDK and apply the preferences above to `res/xml/config.xml` automatically.

## API Reference

The plugin clobbers `cordova.plugins.fullstory` with the JS API below.

| Method                     | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| `restart(success, error)`  | Restarts Fullstory capture after it has been shut down.       |
| `shutdown(success, error)` | Stops Fullstory capture for the remainder of the app session. |

```js
cordova.plugins.fullstory.shutdown(
  function () {
    console.log("Fullstory capture stopped");
  },
  function (err) {
    console.error("Failed to stop Fullstory capture", err);
  },
);

cordova.plugins.fullstory.restart(
  function () {
    console.log("Fullstory capture restarted");
  },
  function (err) {
    console.error("Failed to restart Fullstory capture", err);
  },
);
```

For additional instructions, contact Fullstory support.

## License

MIT
