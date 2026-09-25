# Build from Source

Use this route if you want to develop Nativ locally. You need Xcode with the macOS 26 SDK, [XcodeGen](https://github.com/yonaskolb/XcodeGen), and Python 3.

From the Nativ source directory, run:

```sh
brew install xcodegen
make xcode-generate
make xcode-build
open build/XcodeDerivedData/Build/Products/Debug/Nativ.app
```

The first build assembles a Python runtime and installs Nativ's pinned server dependencies into the app bundle. Later builds reuse the bundle until its inputs change.

After the app opens, continue with [Downloading Models](/getting-started/downloading-models).
