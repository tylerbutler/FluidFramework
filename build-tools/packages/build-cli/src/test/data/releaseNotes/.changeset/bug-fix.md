---
"@fluidframework/merge-tree": minor
"@fluidframework/sequence": minor
---

Fix memory leak in merge tree operations

This changeset addresses a critical memory leak that was occurring during intensive merge tree operations. The issue was identified in long-running collaborative sessions where memory usage would continuously grow over time.

**Changes made:**
- Fixed improper disposal of event listeners in merge tree nodes
- Improved garbage collection of abandoned tree segments
- Added proper cleanup in the sequence reconciliation process

**Impact:**
This fix significantly improves the stability of applications using Fluid Framework for extended periods, particularly those with high collaboration activity.