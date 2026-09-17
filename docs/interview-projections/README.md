# Apple Senior iOS — Interview Projections

> Чернетка для підготовки. Це **не інсайдерська інформація** і не прогноз конкретних питань. Це робочі проєкції, побудовані з опису команди та вже пройденого System Design interview.

## Team context

Зі слів інтерв'юера, команда працює переважно з **aggregation + transformation of data**:

- multi-device camera capture — наприклад, 3–4 iPhone одночасно знімають одну сцену;
- синхронізація кількох девайсів відносно спільного clock / time base;
- обробка, агрегація та трансформація кількох video/data streams;
- sensor/video data з Apple Vision Pro;
- передача та подальша обробка отриманих даних.

Сусідня команда працює зі схожими pipeline-задачами у Health domain. Уже пройдений System Design interview був про sensor data flow: **Apple Watch → iPhone → cloud**.

Цей контекст робить особливо релевантними задачі про streams, timestamps, windows, buffering, ordering, aggregation, synchronization та efficient data processing.

## Interview tracks

### 1. Data Structures & Coding

- Working notes: [data-structures-and-coding.md](./data-structures-and-coding.md)
- Visual fast track: [Coding Interview Fast Track](../../modules/coding-interview-fast-track/)

До інтерв'ю фокус навмисно звужений до **4 patterns**:

1. **HashMap / Set** — duplicate, count, lookup.
2. **Two Pointers** — sorted arrays / timestamp streams / matching.
3. **Sliding Window** — contiguous ranges / last N / recent data.
4. **Heap / Priority Queue** — concept only: repeated min/max, Top-K, K streams.

Все інше — later, щоб не перевантажувати підготовку за два дні.

### 2. Swift & Apple Systems

Поки що high-level projection:

- Swift Concurrency: `async/await`, `Task`, task groups, actors, cancellation, `Sendable`;
- GCD: serial/concurrent queues, barriers, synchronization, QoS;
- sequences / collections / higher-order functions: `map`, `filter`, `reduce`, `compactMap`, `zip`;
- memory ownership / ARC, copying vs sharing large buffers;
- threading, race conditions, data isolation;
- producer/consumer pipelines;
- `AsyncSequence` / `AsyncStream` for continuous sensor/event streams;
- backpressure and bounded buffering;
- performance implications of value types, COW and large data structures;
- Apple platform primitives that may appear around capture, sensors, networking or persistence.

### 3. AI + Technical Leadership

Поки що high-level projection:

- practical coding with an available LLM;
- task decomposition and context management;
- validating AI-generated code rather than trusting it blindly;
- identifying correctness, performance, concurrency and API problems in generated code;
- iterating from rough AI output to production-quality solution;
- technical trade-offs and ambiguous requirements;
- disagreement with senior engineers / managers;
- influence without authority;
- mentoring and raising engineering quality;
- project ownership from ambiguity to delivery;
- failure / wrong decision and learned lesson;
- motivation for the team and role.

## Working principle

For each projected coding task we want to know:

1. What real problem is being modeled?
2. Which data structure / algorithmic pattern fits it?
3. What complexity should be expected?
4. What edge cases matter?
5. How could the interviewer extend the task?
6. How does it connect to the team's real data pipelines?

This folder is intentionally temporary and interview-focused. Useful material can later be promoted into permanent Algorithms, Swift Concurrency, GCD or System Design modules.
