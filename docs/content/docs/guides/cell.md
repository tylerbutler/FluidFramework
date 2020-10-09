---
title: "SharedCell"
menuPosition: 1
---

The SharedCell distributed data structure can be used to store a single value.

## Summary

<!--
|                |                           |
| -------------- | ------------------------- |
| Merge strategy | Last writer wins (LWW)    |
| Storable types | Any plain object or value |
| Optimistic     | Yes                       |
|                |                           |
-->


| DDS                 | Merge Strategy         | Optimistic/Consensus | Storable types            |
| ------------------- | ---------------------- | -------------------- | ------------------------- |
| [SharedCell][]      | Last writer wins (LWW) | Optimistic           | Any plain object or value |
| [SharedMap][]       |                        | Optimistic           | Any plain object or value |
| [SharedDirectory][] |                        | Optimistic           |                           |
|                     |                        |                      |                           |

## Concepts and applications

The SharedCell distributed data structure is used to store single values in the Fluid Framework. It's useful in
situations where you need to store a single piece of data in your Fluid data model.

Since you can store pieces of data in SharedMaps or SharedDirectories, it's not immediately obvious when the SharedCell
is useful. In many cases, using a cell instead of a map key is a stylistic choice, but there is an advantage to using a
cell: you can listen to events _just_ for the object stored in the cell, rather than listening to the map's valueChanged
event and filtering.

### Example

The [Badge DataObject](https://fluidframework.com/playground/?path=/docs/react-demos-badge--demo) uses a SharedCell to
store the current value of the drop-down menu. An alternative would be to store the value in a SharedMap key, but this
results in more complex code, especially around event handling.

## Usage

### Creation

To create a SharedCell, call the static [create][cell.create] method.

```typescript
const myCell = SharedCell.create(this.runtime);
```

The value stored in the cell can be set with the [set()][cell.set] method and retrieved with the [get()][cell.get]
method:

```typescript
myCell.set(3);
console.log(myCell.get()); // 3
```

Calling set() will trigger a `valueChanged` event.

**Signature**

```typescript
static create(runtime: IFluidDataStoreRuntime, id?: string): SharedCell<any>;
```


### Deletion

The [delete()][cell.delete] method will delete the stored value from the cell:

```typescript
myCell.delete();
console.log(myCell.get()); // undefined
```

Calling delete() will trigger a `delete` event.


**Signature**

```typescript
delete(): void;
```
<div class=return-section><b>Returns:</b>

</div>

### Other methods

The [empty()][cell.empty] method will check if the value is `undefined`.

```typescript
if (myCell.empty()) {
  // myCell.get() will return undefined
} else {
  // myCell.get() will return a non-undefined value
}
```

**Signature**

```typescript
empty(): boolean;
```

<div class=return-section><b>Returns:</b>

`true` if the value of cell is `undefined`<!-- -->, `false` otherwise

</div>


## Events

SharedCell, like all DDSes, will emit events when clients make modifications. You should register for these events and
respond appropriately as the data is modified.

| Method   | Triggered event |
| -------- | --------------- |
| set()    | `valueChanged`  |
| delete() | `delete`        |
|          |                 |

<!-- AUTO-GENERATED-CONTENT:START (INCLUDE:path=_includes/links.md) -->
<!-- Links -->

<!-- Concepts -->

[Fluid container]: {{< relref "/docs/concepts/containers-runtime.md" >}}

<!-- Packages -->

[Aqueduct]: {{< relref "/apis/aqueduct.md" >}}
[undo-redo]: {{< relref "/apis/undo-redo.md" >}}

<!-- Classes and interfaces -->

[ContainerRuntimeFactoryWithDefaultDataStore]: {{< relref "/apis/aqueduct/containerruntimefactorywithdefaultdatastore.md" >}}
[DataObject]: {{< relref "/apis/aqueduct/dataobject.md" >}}
[DataObjectFactory]: {{< relref "/apis/aqueduct/dataobjectfactory.md" >}}
[Ink]: {{< relref "/apis/ink/ink.md" >}}
[SharedCell]: {{< relref "/docs/guides/cell.md" >}}
[SharedCounter]: {{< relref "SharedCounter" >}}
[SharedDirectory]: {{< relref "/apis/map/shareddirectory.md" >}}
[SharedMap]: {{< relref "/apis/map/sharedmap.md" >}}
[SharedMatrix]: {{< relref "SharedMatrix" >}}
[SharedNumberSequence]: {{< relref "SharedNumberSequence" >}}
[SharedObjectSequence]: {{< relref "/apis/sequence/sharedobjectsequence.md" >}}
[SharedSequence]: {{< relref "SharedSequence" >}}
[SharedString]: {{< relref "SharedString" >}}
[Quorum]: {{< relref "/apis/protocol-base/quorum.md" >}}

<!-- Sequence methods -->

[sequence.insert]: {{< relref "/apis/sequence/sharedsequence.md#sequence-sharedsequence-insert-Method" >}}
[sequence.getItems]: {{< relref "/apis/sequence/sharedsequence.md#sequence-sharedsequence-getitems-Method" >}}
[sequence.remove]: {{< relref "/apis/sequence/sharedsequence.md#sequence-sharedsequence-getitems-Method" >}}
[sequenceDeltaEvent]: {{< relref "/apis/sequence/sequencedeltaevent.md" >}}

<!-- Cell methods -->
[cell.create]: {{< relref "/apis/cell/sharedcell.md#cell-sharedcell-create-Method" >}}
[cell.delete]: {{< relref "/apis/cell/sharedcell.md#cell-sharedcell-delete-Method" >}}
[cell.empty]: {{< relref "/apis/cell/sharedcell.md#cell-sharedcell-empty-Method" >}}
[cell.get]: {{< relref "/apis/cell/sharedcell.md#cell-sharedcell-get-Method" >}}
[cell.set]: {{< relref "/apis/cell/sharedcell.md#cell-sharedcell-set-Method" >}}

[.handle]: {{< relref "/apis/shared-object-base/sharedobject.md#shared-object-base-sharedobject-handle-Property" >}}

<!-- AUTO-GENERATED-CONTENT:END -->
