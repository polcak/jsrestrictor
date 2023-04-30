# AssemblyScript farbling implementation
This package contains a small and efficient image and audio data farbling implementation in AssemblyScript.
The compiled WebAssembly module has around 1kB, which is efficient enough to inject into every page.
This implementation will result in the same farbling outcome as the original JavaScript implementation under the same conditions, which is neccessary to prevent fingerprinting as the WebAssembly module injection isn't completely reliable and the JS implementation must be used as a fallback.

## Prerequisites
* NodeJS

## Compiling
First, initialize the node module and download dependencies by running:
```
npm install
```

After initialization, the module can be compiled by running:
```
npm run debug
npm run release
```

The Makefile supplied with JShelter will take care of all steps required for this module's compilation and correct inclusion during the build process.
