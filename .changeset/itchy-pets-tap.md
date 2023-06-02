---
"@fluidframework/sequence": minor
---

`IntervalCollection` has been deprecated in favor of an interface (`IIntervalCollection`) containing its public API.
Several types transitively referenced by `IntervalCollection` implementation details have also been deprecated:
`CompressedSerializedInterval`, `IntervalCollectionIterator`, and `ISerializedIntervalCollectionV2`.
