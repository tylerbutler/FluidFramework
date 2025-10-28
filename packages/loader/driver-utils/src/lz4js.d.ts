// Minimal type declarations for lz4js
// Temporary workaround for Bazel build - Session 2.8

declare module 'lz4js' {
  export function compress(data: Uint8Array): Uint8Array;
  export function decompress(data: Uint8Array): Uint8Array;
}
