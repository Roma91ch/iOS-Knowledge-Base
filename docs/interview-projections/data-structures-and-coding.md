# Data Structures & Coding — Apple Team Projections

> **Purpose:** build a useful shape of the likely problem space before drilling individual LeetCode-style exercises.
>
> These are **projections, not predictions**. The interviewer can still give a completely generic coding problem. The value here is that the team's domain strongly suggests a set of reusable algorithmic patterns worth prioritizing.

## 0. What the team context suggests

The recurring nouns are:

`multiple streams` · `timestamps` · `shared clock` · `sensor data` · `video frames` · `aggregation` · `transformation` · `buffering` · `ordering`

That maps surprisingly well to a small set of interview patterns:

- **two pointers / multiple pointers**;
- **min-heap / priority queue**;
- **sliding window**;
- **deque / queue / circular buffer**;
- **hash map / hash set**;
- **sorting + linear scan**;
- **intervals**;
- **binary search on sorted timestamps**;
- **streaming state machines**;
- **bounded memory / incremental processing**.

The most important preparation goal is therefore not memorizing 30 solutions. It is recognizing the shape of the problem quickly.

---

# 1. Overall task map

| Possible task | Typical interview wording | Core pattern | Main DS |
|---|---|---|---|
| Merge K streams | Merge events from several devices in timestamp order | K-way merge | Min-heap |
| Match synchronized samples | Pair frames/events whose timestamps differ by ≤ tolerance | Two pointers / sliding window | Arrays / deque |
| Nearest timestamp | Find the sensor sample closest to a video frame timestamp | Binary search | Sorted array |
| Sliding aggregation | Average/count/max over the last N ms / last K events | Sliding window | Queue/deque |
| Fixed-size capture buffer | Keep only the latest N frames/events | Circular buffer | Array + indices |
| Reorder late events | Events arrive slightly out of order; emit ordered output | Heap + watermark | Min-heap |
| Deduplicate events | Ignore duplicate IDs / duplicate samples in recent history | Hashing + bounded window | Set / dictionary |
| Merge intervals | Combine overlapping recording/session ranges | Sort + scan | Array |
| Detect missing sequence ranges | Find dropped frames / missing sequence numbers | Linear scan / hashing | Array / set |
| Bucket by time | Group events into 10 ms / 1 sec buckets and aggregate | Hashing / integer math | Dictionary |
| Top-K samples | Keep K highest-quality frames/readings | Heap | Priority queue |
| Bounded processing queue | Buffer work without unbounded memory growth | Queue / ring buffer | Deque / circular array |

---

# 2. Strongest domain-shaped projections

## A. Merge multiple timestamped streams

### Problem shape

Several devices independently produce events already sorted by timestamp. Produce one globally ordered sequence.

```text
iPhone A:  10, 20, 40, 70
iPhone B:  12, 21, 35, 80
iPhone C:  11, 25, 50, 60

Output:    10, 11, 12, 20, 21, 25, 35, 40, 50, 60, 70, 80
```

### Algorithmic backing

This is the classic **merge K sorted lists / arrays** problem.

For two streams:

- two pointers;
- `O(n + m)` time;
- `O(1)` auxiliary space, ignoring output.

For K streams:

- min-heap containing the current smallest event from each stream;
- pop smallest, advance only that stream, push its next event;
- `O(N log K)` time;
- `O(K)` heap space.

### Why it fits the team

If multiple iPhones or sensors are locked to a common time base, downstream processing frequently needs a globally ordered view of events.

### Swift shape

```swift
struct Event {
    let timestamp: UInt64
    let sourceID: Int
}

func merge(_ streams: [[Event]]) -> [Event] {
    // likely solution: min-heap of (event, streamIndex, eventIndex)
    []
}
```

### Follow-ups an interviewer can add

- streams are huge and cannot all fit in memory;
- streams are asynchronous instead of arrays;
- two timestamps can be identical;
- stable ordering by source ID is required;
- one stream stalls;
- events arrive out of order.

---

## B. Synchronize / match events within a timestamp tolerance

### Problem shape

Two cameras capture approximately the same moments but timestamps are not exactly equal. Match samples if the time difference is within `Δ`.

```text
A: 100, 205, 300, 405
B:  97, 210, 302, 500
Δ = 10

matches:
100 ↔ 97
205 ↔ 210
300 ↔ 302
```

### Algorithmic backing

Usually:

- **two pointers** for two sorted streams;
- possibly **sliding window** when multiple candidates can match;
- for K streams, multiple pointers or a heap depending on exact requirements.

Typical complexity for two sorted arrays:

- `O(n + m)` time;
- `O(1)` extra space.

### Key reasoning

At every step:

- if timestamps are close enough → match;
- otherwise advance the pointer with the earlier timestamp;
- never move a pointer backwards.

### Why it fits the team

This is almost a direct abstraction of aligning frames or sensor samples from several devices sharing a time base.

### Possible variants

- every event may be matched only once;
- choose the **closest** event, not merely any event within tolerance;
- synchronize 3–4 sources;
- one source has a different sample rate;
- drop unmatched samples.

---

## C. Find the closest sensor sample to a timestamp

### Problem shape

A video frame has timestamp `t`. Sensor readings are sorted by timestamp. Find the reading nearest to `t`.

```text
samples = [100, 130, 170, 220, 300]
t = 200

answer = 220
```

### Algorithmic backing

**Binary search**.

Find insertion position for `t`, then compare the two neighbors.

- `O(log n)` lookup;
- `O(1)` space.

If many query timestamps are also sorted, a two-pointer solution can reduce the entire workload to roughly `O(n + m)`.

### Why this matters

A very realistic interview extension is asking whether repeated binary searches are optimal when both inputs are sorted.

---

## D. Sliding-window aggregation over sensor events

### Problem shape

Calculate a rolling metric such as:

- average signal value over the last 1 second;
- number of frames in the last 100 ms;
- max quality score among recent frames;
- moving average over the latest N samples.

### Algorithmic backing

**Sliding window**.

For rolling sum / average:

- queue/deque of active elements;
- add incoming value;
- remove expired values;
- maintain running sum;
- amortized `O(1)` per event.

For rolling maximum/minimum:

- **monotonic deque**;
- amortized `O(1)` per element.

### Example

```swift
struct Sample {
    let timestamp: Int
    let value: Double
}

func rollingAverage(
    _ samples: [Sample],
    windowMilliseconds: Int
) -> [Double] {
    // sliding window + running sum
    []
}
```

### What the interviewer may probe

A naive implementation recalculates every window from scratch and becomes `O(n * windowSize)`. The expected improvement is usually to preserve incremental state.

---

## E. Circular / ring buffer

### Problem shape

Store only the latest `N` frames or sensor values. Once capacity is reached, new data overwrites the oldest data.

```text
capacity = 4

insert A → [A]
insert B → [A B]
insert C → [A B C]
insert D → [A B C D]
insert E → [E B C D]   // logical order: B C D E
```

### Algorithmic backing

**Circular buffer** implemented with:

- fixed array;
- `head` / `tail` indices;
- modulo arithmetic.

Expected operations:

- append: `O(1)`;
- remove oldest: `O(1)`;
- fixed `O(capacity)` memory.

### Why it fits the team

Continuous video/sensor systems cannot casually retain an unbounded history. Fixed-memory buffers are a natural primitive.

### Interview traps

Be precise about:

- empty vs full state;
- wrap-around;
- count;
- overwrite semantics;
- capacity zero;
- returning elements in logical rather than physical array order.

---

## F. Reorder slightly out-of-order events

### Problem shape

Events have trustworthy timestamps but arrive slightly late or out of order.

```text
arrival order:
100, 130, 110, 140, 120

expected emitted order:
100, 110, 120, 130, 140
```

The catch: the stream is potentially infinite, so we cannot simply collect everything and sort at the end.

### Algorithmic backing

A common streaming pattern:

- min-heap ordered by timestamp;
- known maximum lateness / reorder window;
- keep a watermark representing how far time has safely progressed;
- emit values that can no longer be preceded by a valid late event.

### Why this is interesting in an interview

It tests more than syntax. You have to identify an unstated requirement:

> Without some bound on how late events can arrive, a correct online algorithm cannot know when an event is safe to emit.

That clarification itself is valuable Senior-level reasoning.

---

## G. Deduplicate recent events

### Problem shape

A transport layer retries data and occasionally delivers an event twice. Remove duplicates.

Simple case:

```text
IDs: 1, 2, 2, 3, 1, 4
→   1, 2, 3, 4
```

### Algorithmic backing

Basic finite input:

- hash set;
- expected `O(n)` time;
- `O(n)` memory.

Infinite stream:

- an unbounded set is not acceptable;
- maintain only recent IDs using a queue + set, TTL, sequence range, or LRU-like structure.

### Why it fits

Reliable data-transfer pipelines naturally encounter retries, duplicated chunks and reconnect behavior.

---

## H. Merge overlapping time intervals

### Problem shape

Recording or availability ranges overlap.

```text
[1, 5], [3, 7], [10, 12], [11, 15]

→ [1, 7], [10, 15]
```

### Algorithmic backing

Classic **Merge Intervals**:

1. sort by start time;
2. scan from left to right;
3. merge when current start ≤ previous end.

Complexity:

- `O(n log n)` because of sorting;
- `O(n)` scan.

If input is already sorted, the processing portion is `O(n)`.

### Variants

- find intersection instead of union;
- find gaps;
- compute total covered duration;
- merge intervals from multiple devices.

---

## I. Detect dropped frames / missing sequence ranges

### Problem shape

Frames carry monotonically increasing sequence numbers.

```text
100, 101, 102, 106, 107, 110

missing:
103...105
108...109
```

### Algorithmic backing

If ordered:

- single linear scan;
- `O(n)` time;
- `O(1)` auxiliary space.

If unordered:

- sorting → `O(n log n)`;
- or hashing when the numeric range is appropriate.

### What this can test

- off-by-one correctness;
- range representation;
- duplicates;
- unordered input;
- extremely large sequence ranges.

---

## J. Time bucketing / aggregation

### Problem shape

Group events into fixed windows, for example 100 ms buckets, then calculate count/average/max for each bucket.

```text
bucketSize = 100

timestamps:
21, 45, 117, 150, 199, 201

buckets:
0...99    → 2 events
100...199 → 3 events
200...299 → 1 event
```

### Algorithmic backing

Bucket index:

```swift
let bucket = timestamp / bucketSize
```

Then aggregate with a dictionary or, when the range is dense and known, an array.

Expected:

- `O(n)` time;
- `O(numberOfBuckets)` space.

### Useful interview discussion

This is a good place to discuss whether events are sorted. If sorted, results can often be emitted incrementally without retaining a dictionary of every bucket.

---

# 3. Secondary but still plausible tasks

## Top-K frames / readings

Example: keep the 10 highest-quality frames out of a huge stream.

Pattern:

- min-heap of size `K`;
- `O(n log K)`;
- `O(K)` space.

The important observation is that sorting all `n` elements is unnecessary.

---

## Bounded queue / producer-consumer buffer

The coding portion may simplify a real pipeline problem into implementing a queue with a maximum capacity.

Potential policies:

- reject newest;
- drop oldest;
- block producer;
- overwrite oldest.

The algorithmic core is often a queue/deque or circular buffer. The concurrency policy belongs more naturally to the Swift & Apple Systems interview.

---

## LRU cache

Could model cached transformed chunks, metadata or recently accessed objects.

Canonical implementation:

- dictionary → node lookup in `O(1)`;
- doubly linked list → recency order in `O(1)`;
- `get` / `put` both `O(1)` average.

Not especially specific to the team, but still a common Senior coding pattern.

---

# 4. Patterns to recognize immediately

## Two pointers

Think of it when:

- both inputs are sorted;
- you need matching / intersection / merge;
- pointers only need to move forward.

Typical team-shaped problems:

- synchronize two timestamp streams;
- merge two streams;
- compare sensor and video events;
- find intersections of active time ranges.

---

## Sliding window

Think of it when the wording includes:

- last N events;
- last X milliseconds;
- contiguous range;
- moving average;
- recent history.

Often combined with:

- running sum;
- dictionary of counts;
- deque;
- monotonic deque.

---

## Heap / priority queue

Think of it when:

- repeatedly need the smallest/largest element;
- merging K sorted sources;
- Top-K;
- bounded reordering of events.

Common complexity signal:

```text
O(N log K)
```

instead of sorting all data globally.

---

## Hash map / set

Think of it when:

- membership matters;
- duplicates matter;
- counts/frequencies matter;
- lookup by ID matters.

Expected average lookup: `O(1)`.

---

## Sort + scan

Often the simplest optimal-enough approach when dealing with:

- intervals;
- timestamps that are initially unordered;
- grouping adjacent values;
- missing ranges.

Do not reject `O(n log n)` automatically. Sorting can drastically simplify correctness.

---

## Binary search

Think of it when:

- timestamp samples are sorted;
- you need nearest / first ≥ target / last ≤ target;
- repeated point queries are made against stable data.

Know the difference between finding an exact value and finding an insertion boundary.

---

# 5. Swift-specific implementation areas worth refreshing

These are not separate algorithms, but they can make or break the coding round.

### Collection indexing

`String` is **not** integer-indexed in Swift. Arrays are much easier for algorithmic pointer work.

### Dictionary / Set

Be fluent with:

```swift
var counts: [Int: Int] = [:]
counts[value, default: 0] += 1

var seen: Set<Int> = []
if seen.insert(value).inserted {
    // first occurrence
}
```

### Sorting

```swift
let sorted = events.sorted { $0.timestamp < $1.timestamp }
```

### Higher-order functions

Useful when they improve clarity:

```swift
map
compactMap
filter
reduce
zip
```

But in algorithm interviews, a plain loop is often easier to reason about for complexity and stateful window logic.

### Heap

Swift's standard library historically has not exposed a universal built-in `Heap` type across all interview environments. Be prepared either to:

- implement a minimal binary heap;
- use a heap utility if CoderPad provides one;
- first explain the heap-based optimal solution, then code a simpler version if the interviewer explicitly accepts it.

Minimal conceptual API:

```swift
struct MinHeap<Element> {
    mutating func insert(_ element: Element) {}
    mutating func popMin() -> Element? { nil }
    var min: Element? { nil }
}
```

For the interview, understand `siftUp` and `siftDown` even if a full generic production heap is unnecessary.

---

# 6. Complexity expectations

For this team-shaped problem space, these are useful mental anchors:

| Pattern | Typical time | Typical extra space |
|---|---:|---:|
| Two-pointer merge | `O(n + m)` | `O(1)` |
| K-way merge | `O(N log K)` | `O(K)` |
| Sliding window | `O(n)` | window-dependent |
| Hash dedupe | `O(n)` average | `O(n)` or bounded window |
| Merge intervals | `O(n log n)` | `O(n)` output |
| Binary search | `O(log n)` | `O(1)` |
| Ring buffer append/remove | `O(1)` | fixed `O(capacity)` |
| Top-K with heap | `O(n log K)` | `O(K)` |

The interviewer may care as much about **bounded memory** as raw asymptotic runtime because the real domain involves continuous streams and potentially large video/sensor data.

---

# 7. Clarifying questions that signal good Senior reasoning

For streaming/data questions, ask before coding when relevant:

> Are events already sorted by timestamp?

> Are timestamps unique?

> Can events arrive late or out of order?

> Is there a known maximum lateness / tolerance?

> Is the input finite, or should the solution work as a stream?

> Can all input fit in memory?

> Can one event match more than one event from another source?

> If multiple candidates are within tolerance, should I choose the nearest one?

> What should happen with unmatched events?

> Do we optimize for latency, memory, throughput, or simplest correctness?

These questions can completely change the correct algorithm.

---

# 8. Do not overfit to the team's domain

Even with this context, the coding round may still be a standard generic problem unrelated to cameras or sensors. A safe baseline is to remain comfortable with:

- arrays / strings;
- hash maps / sets;
- two pointers;
- sliding window;
- stack / queue;
- linked-list basics;
- binary search;
- intervals;
- heap / Top-K;
- basic tree traversal BFS / DFS;
- basic graph traversal BFS / DFS;
- recursion vs iterative traversal;
- Big-O analysis.

For this particular preparation window, the **highest-value overlap** between generic interviews and the team's domain is:

```text
Two Pointers
→ Sliding Window
→ Hash Map / Set
→ Heap / Priority Queue
→ Intervals
→ Binary Search
→ Queue / Circular Buffer
```

---

# 9. Suggested drill order

Do not start by solving random problems. Drill the patterns in this order:

1. merge two sorted timestamp arrays — **two pointers**;
2. match timestamps within tolerance — **two pointers**;
3. closest timestamp — **binary search**;
4. rolling average over time — **sliding window**;
5. merge intervals — **sort + scan**;
6. deduplicate stream — **hash set**;
7. merge K streams — **min-heap**;
8. Top-K frames — **heap**;
9. ring buffer — **array + modulo arithmetic**;
10. reorder bounded-late events — **heap + watermark**.

After these, do one generic tree BFS/DFS and one generic graph BFS/DFS so the preparation is not too narrowly tailored.

---

# 10. Next expansion

For each item above, create a separate exercise with:

- interviewer-style prompt;
- 1–2 examples;
- clarification questions;
- naive solution;
- optimized solution;
- Swift implementation;
- Big-O;
- common mistakes;
- follow-up variations;
- relation to camera / sensor pipelines.

The first exercises to expand should be:

1. **Merge K Timestamped Streams**
2. **Synchronize Two Streams Within Tolerance**
3. **Sliding Window Sensor Aggregation**
4. **Circular Buffer for Recent Frames**
5. **Reorder Bounded-Late Events**
