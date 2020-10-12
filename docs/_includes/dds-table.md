
{{< bootstrap-table "table table-dark table-striped table-bordered" >}}

| DDS                                                                             | Merge Strategy         | Optimistic/Consensus | Storable types            |
| ------------------------------------------------------------------------------- | ---------------------- | -------------------- | ------------------------- |
| [Ink]({{< relref "/apis/ink/ink.md" >}})                                        |                        | Optimistic           |                           |
| [SharedCell]({{< relref "/docs/guides/cell.md" >}})                             | Last writer wins (LWW) | Optimistic           | Any plain object or value |
| [SharedCounter]({{< relref "/apis/counter/sharedcounter.md" >}})                |                        |                      | Any number                |
| [SharedDirectory]({{< relref "/apis/map/shareddirectory.md" >}})                | Last writer wins (LWW) | Optimistic           | Any plain object or value |
| [SharedMap]({{< relref "/apis/map/sharedmap.md" >}})                            | Last writer wins (LWW) | Optimistic           | Any plain object or value |
| [SharedMatrix]({{< relref "/apis/matrix/sharedmatrix.md" >}})                   |                        |                      |                           |
| [SharedNumberSequence]({{< relref "/apis/sequence/sharednumbersequence.md" >}}) |                        |                      | Any number                |
| [SharedObjectSequence]({{< relref "/apis/sequence/sharedobjectsequence.md" >}}) |                        |                      | Any plain object or value |
| [SharedString]({{< relref "/apis/sequence/sharedstring.md" >}})                 |                        |                      |                           |

{{< /bootstrap-table >}}
