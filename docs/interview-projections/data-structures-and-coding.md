# Data Structures & Coding — 2-Day Fast Track

> **Goal:** не вивчити algorithms & data structures за два дні. Goal — побачити задачу, впізнати знайомий shape і мати простий starting point.
>
> **Important:** це projections based on team context, not predictions of actual Apple questions.

## STOP: study only these 4 patterns

For this interview window, ignore the long list of possible algorithms. Focus on:

1. **Hash Map / Set** — lookup, duplicates, counting
2. **Two Pointers** — two sorted streams / matching
3. **Sliding Window** — recent contiguous range / last N samples
4. **Heap / Priority Queue** — only conceptual level for K streams / repeatedly smallest-largest

Everything else is **Later**, not preparation for the next two days.

---

# 1. Hash Map / Set — MUST KNOW

## Mental model

> I need to remember something I already saw and find it quickly.

Typical clues:

- "Have I seen this value before?"
- duplicates
- frequency / count
- lookup by ID
- find a complement such as `target - value`

### Team-shaped example

A sensor packet has an `eventID`. Retries can deliver the same event twice. Keep a `Set` of IDs already processed and skip duplicates.

```swift
var seen: Set<Int> = []

for id in eventIDs {
    if seen.contains(id) {
        continue
    }

    seen.insert(id)
    // process event
}
```

Typical complexity: average `O(1)` lookup, therefore often `O(n)` for the whole input.

## NeetCode practice

### First: Contains Duplicate — LC 217

NeetCode: https://www.youtube.com/watch?v=3OamzN90kPg

Why: simplest possible "when do I reach for a Set?" example.

### Then: Two Sum — LC 1

NeetCode: https://www.youtube.com/watch?v=KLlXCFG5TnA

Why: shows the most important interview transformation:

```text
nested search O(n²)
→ remember previous values in HashMap
→ O(n)
```

### Optional quick reference

NeetCode HashMap crash course:
https://neetcode.io/cheatsheets/hashmap-crash-course

**Do not** learn hash-table implementation internals now.

---

# 2. Two Pointers — MUST KNOW

## Mental model

> I have ordered data and two positions can move through it without going backwards.

Typical clues:

- sorted array(s)
- compare left vs right
- merge two sorted inputs
- match values from two streams
- find pairs

### Team-shaped example

Two iPhones produce timestamped frames:

```text
A = [100, 205, 300, 405]
B = [ 97, 210, 302, 500]
tolerance = 10
```

We want to match timestamps that are close enough.

Conceptually:

```text
A[i] ≈ B[j] → match, move both
A[i] < B[j] → move i
A[i] > B[j] → move j
```

Each pointer only moves forward, so instead of comparing every item with every other item, the scan can be `O(n + m)`.

## NeetCode practice

### Main problem: Two Sum II — LC 167

NeetCode: https://www.youtube.com/watch?v=cQ1Oz4ckceM

Relevant timestamps in the video:

- intuition / brute force first
- around `3:55` — two-pointer optimal approach
- around `6:39` — implementation

This is the one Two Pointers problem to understand before the interview.

### Optional: Valid Palindrome — LC 125

NeetCode: https://www.youtube.com/watch?v=jJXJ16kPFWg

Only do it if Two Sum II already makes sense.

## Recognition phrase

When you see **sorted input + matching/comparing**, ask:

> Can I put one pointer on each side / each stream and move only forward?

---

# 3. Sliding Window — MUST KNOW

## Mental model

> I care about one contiguous moving region, not every possible combination.

Typical clues:

- "last N elements"
- "last X seconds"
- contiguous subarray / substring
- moving average
- longest/shortest contiguous range satisfying a condition

### Team-shaped example

Sensor samples arrive continuously. Calculate the average over the latest 1 second.

Instead of recalculating the whole range for every sample:

```text
add new sample on the right
remove expired sample(s) from the left
keep the window state
```

Visually:

```text
[ 10 12 14 ] 20 25
      ↓ slide
10 [ 12 14 20 ] 25
```

The important idea is just **left boundary + right boundary + state for what is inside**.

## NeetCode practice

### First: Best Time to Buy and Sell Stock — LC 121

NeetCode: https://www.youtube.com/watch?v=1pkOgXD63yU

This is the easier introduction. NeetCode explicitly presents it as Sliding Window.

### Only if comfortable: Longest Substring Without Repeating Characters — LC 3

NeetCode: https://www.youtube.com/watch?v=wiGpQwVHdE0

This combines:

```text
Sliding Window + Set
```

and is a very useful example of patterns composing together.

Do **not** study Sliding Window Maximum / monotonic deque now.

## Recognition phrase

When you see **contiguous + longest/shortest/recent**, ask:

> Can I keep a left and right boundary and update the answer while the window moves?

---

# 4. Heap / Priority Queue — KNOW THE IDEA, NOT THE IMPLEMENTATION

## Mental model

> I repeatedly need the smallest or largest item, but I do not need the entire collection fully sorted.

For this interview, the goal is only to recognize what a heap is useful for.

Typical clues:

- smallest/largest repeatedly
- Top K
- merge K sorted streams
- "what event should be processed next?"

### Team-shaped example

Three timestamp streams:

```text
A: 10, 40, 70
B: 12, 35, 80
C: 11, 50, 60
```

To build one ordered stream, keep only the current next event from each source in a **min-heap**.

```text
heap initially: 10(A), 12(B), 11(C)

pop 10(A)
push next from A → 40(A)

pop 11(C)
push next from C → 50(C)
...
```

This is the idea behind **K-way merge**.

You do **not** need to implement a generic binary heap from scratch in the next two days unless an interviewer specifically asks.

## Fastest useful video

NeetCode — Top 8 Data Structures for Coding Interviews:
https://www.youtube.com/watch?v=uhYq27iSk9s

Jump to roughly `9:47` for the Heap section. Do not watch a multi-hour heap course.

### Optional application

NeetCode — Merge K Sorted Lists — LC 23:
https://www.youtube.com/watch?v=q5a5OiGbT6Q

Watch for the problem shape, not to memorize linked-list code.

## Recognition phrase

When you see **repeatedly give me min/max among many candidates**, think:

> Priority Queue / Heap might fit here.

---

# One-screen recognition map

```text
Need fast lookup / duplicate / count?
→ HashMap / Set

Sorted inputs + compare / match / merge?
→ Two Pointers

Contiguous range / last N / recent time window?
→ Sliding Window

Repeated smallest/largest across many candidates?
→ Heap / Priority Queue
```

That is the whole mental map for now.

---

# How these patterns can combine

Real interview questions are not always "one algorithm".

### Example A

```text
Longest range with no duplicate event IDs
```

Likely:

```text
Sliding Window + Set
```

### Example B

```text
Match two sorted timestamp streams within ±10 ms
```

Likely:

```text
Two Pointers
```

### Example C

```text
Merge the next timestamped event from 4 devices
```

Likely:

```text
Heap / Priority Queue
```

### Example D

```text
Ignore duplicate packets while processing a stream
```

Likely:

```text
Hash Set
```

---

# 2-day preparation boundary

## Must do

- understand HashMap / Set recognition;
- solve or re-solve `Contains Duplicate` and `Two Sum`;
- understand `Two Sum II` and implement the Two Pointers solution yourself;
- understand `Best Time to Buy and Sell Stock` as a moving-window problem;
- understand what a min-heap / priority queue gives you conceptually;
- for every solution, say Time + Space complexity out loud.

## Only if there is time

- `Valid Palindrome`;
- `Longest Substring Without Repeating Characters`;
- conceptual `Merge K Sorted Lists`.

## Explicitly NOT NOW

Do not spend the next two days learning:

- BFS / DFS;
- trees;
- graphs;
- tries;
- dynamic programming;
- backtracking;
- monotonic queues;
- advanced interval algorithms;
- heap implementation from scratch;
- advanced binary-search variants;
- streaming watermarks / reorder algorithms.

They are useful topics eventually, but adding them now creates more noise than interview readiness.

---

# What success looks like on Friday

Success is **not** "I know NeetCode 150."

Success is being able to hear a problem and do this:

```text
1. Clarify the input and constraints.
2. Give a simple brute-force solution first.
3. State its Big-O.
4. Notice one familiar pattern if it applies.
5. Improve the solution.
6. Write straightforward Swift.
7. Test it with 2–3 edge cases.
```

If the optimal pattern does not come immediately, a correct brute-force implementation plus clear reasoning is still a much better starting point than freezing while searching for a memorized algorithm.
