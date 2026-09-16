globalThis.CODE_REVIEW_CHALLENGES = Object.freeze([
  {
    id: 'swiftui-owned-observable-object',
    category: 'swiftui',
    categoryLabel: 'SwiftUI',
    title: 'Who owns this store?',
    context: 'The profile reloads whenever its parent view changes unrelated state.',
    prompt: 'Review the property wrapper and the lifetime of the reference.',
    cleanCode: `final class ProfileStore: ObservableObject {
    @Published var name = ""

    init() { loadProfile() }
}

struct ProfileView: View {
    @ObservedObject var store = ProfileStore()

    var body: some View {
        Text(store.name)
    }
}`,
    annotatedCode: `final class ProfileStore: ObservableObject {
    @Published var name = ""

    init() { loadProfile() }
}

struct ProfileView: View {
    // ⚠️ The view creates this object, but @ObservedObject does not own
    // its lifetime. A new view value can create a new store and reload data.
    // Fix: use @StateObject for a view-owned ObservableObject.
    @ObservedObject var store = ProfileStore()

    var body: some View {
        Text(store.name)
    }
}`,
    fixedCode: `final class ProfileStore: ObservableObject {
    @Published var name = ""

    init() { loadProfile() }
}

struct ProfileView: View {
    @StateObject private var store = ProfileStore()

    var body: some View {
        Text(store.name)
    }
}`
  },
  {
    id: 'swiftui-input-as-state',
    category: 'swiftui',
    categoryLabel: 'SwiftUI',
    title: 'A parent update never arrives',
    context: 'The parent passes a new count, but the row keeps displaying its original value.',
    prompt: 'Decide whether this value is local state or an input.',
    cleanCode: `struct CounterRow: View {
    @State var count: Int

    var body: some View {
        Text("Count: \\(count)")
    }
}`,
    annotatedCode: `struct CounterRow: View {
    // ⚠️ @State owns local storage and uses the passed value only to
    // initialize it. Later parent updates are not a state-sync mechanism.
    // Fix: use let for read-only input, or @Binding if the row edits it.
    @State var count: Int

    var body: some View {
        Text("Count: \\(count)")
    }
}`,
    fixedCode: `struct CounterRow: View {
    let count: Int

    var body: some View {
        Text("Count: \\(count)")
    }
}`
  },
  {
    id: 'swiftui-unstable-foreach-identity',
    category: 'swiftui',
    categoryLabel: 'SwiftUI',
    title: 'Every row is suddenly new',
    context: 'Typing in one row resets focus and produces surprising insert/delete animations.',
    prompt: 'Look at how identity is produced for each render.',
    cleanCode: `var body: some View {
    List {
        ForEach(items.map { (UUID(), $0) }, id: \\.0) { _, item in
            ItemRow(item: item)
        }
    }
}`,
    annotatedCode: `var body: some View {
    List {
        // ⚠️ map creates fresh UUIDs on every body evaluation, so SwiftUI
        // cannot associate a new row with its previous state or animations.
        // Fix: keep a stable ID in the model and iterate the model directly.
        ForEach(items.map { (UUID(), $0) }, id: \\.0) { _, item in
            ItemRow(item: item)
        }
    }
}`,
    fixedCode: `struct Item: Identifiable {
    let id: UUID
    let title: String
}

var body: some View {
    List {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}`
  },
  {
    id: 'swiftui-repeat-side-effect',
    category: 'swiftui',
    categoryLabel: 'SwiftUI',
    title: 'Appearing is not “run once”',
    context: 'Returning from a detail screen triggers another identical request.',
    prompt: 'Review the lifecycle assumption behind this side effect.',
    cleanCode: `struct FeedView: View {
    @StateObject private var model = FeedModel()

    var body: some View {
        FeedList(items: model.items)
            .onAppear {
                model.loadFeed()
            }
    }
}`,
    annotatedCode: `struct FeedView: View {
    @StateObject private var model = FeedModel()

    var body: some View {
        FeedList(items: model.items)
            // ⚠️ onAppear may run whenever this view becomes visible again.
            // This can duplicate requests unless loadFeed() is idempotent/guarded.
            // Fix: model explicit loading state or use .task with clear semantics.
            .onAppear {
                model.loadFeed()
            }
    }
}`,
    fixedCode: `struct FeedView: View {
    @StateObject private var model = FeedModel()

    var body: some View {
        FeedList(items: model.items)
            .task {
                await model.loadFeedIfNeeded()
            }
    }
}`
  },
  {
    id: 'concurrency-stale-search-result',
    category: 'concurrency',
    categoryLabel: 'Concurrency',
    title: 'The oldest search wins',
    context: 'A slow request for “s” overwrites the newer result for “swift”.',
    prompt: 'Follow the lifetime and ordering of the unstructured tasks.',
    cleanCode: `func search(_ query: String) {
    Task {
        let matches = try await api.search(query)
        results = matches
    }
}`,
    annotatedCode: `func search(_ query: String) {
    // ⚠️ Every call launches another untracked task. Older work is not
    // cancelled, and completion order can differ from request order.
    // Fix: retain and cancel the previous task, then check cancellation or
    // verify that query is still current before assigning the result.
    Task {
        let matches = try await api.search(query)
        results = matches
    }
}`,
    fixedCode: `private var searchTask: Task<Void, Never>?

func search(_ query: String) {
    searchTask?.cancel()
    searchTask = Task {
        do {
            let matches = try await api.search(query)
            try Task.checkCancellation()
            results = matches
        } catch is CancellationError {
            return
        } catch {
            searchError = error
        }
    }
}`
  },
  {
    id: 'concurrency-main-actor-ui',
    category: 'concurrency',
    categoryLabel: 'Concurrency',
    title: 'UI state from a detached task',
    context: 'The view observes this model while refresh work runs outside actor isolation.',
    prompt: 'Find the isolation boundary for the mutation.',
    cleanCode: `final class LibraryModel: ObservableObject {
    @Published var books: [Book] = []

    func refresh() {
        Task.detached {
            let books = try await API.fetchBooks()
            self.books = books
        }
    }
}`,
    annotatedCode: `// ⚠️ An observable UI model should have an explicit main-actor boundary.
// Fix: mark the model @MainActor and use Task { ... }, which inherits it.
final class LibraryModel: ObservableObject {
    @Published var books: [Book] = []

    func refresh() {
        // ⚠️ Task.detached does not inherit the caller's actor context.
        Task.detached {
            let books = try await API.fetchBooks()
            // ⚠️ This mutation is not isolated to the main actor.
            self.books = books
        }
    }
}`,
    fixedCode: `@MainActor
final class LibraryModel: ObservableObject {
    @Published private(set) var books: [Book] = []

    func refresh() async throws {
        books = try await API.fetchBooks()
    }
}`
  },
  {
    id: 'uikit-cell-image-race',
    category: 'uikit',
    categoryLabel: 'UIKit',
    title: 'The wrong image after fast scrolling',
    context: 'A reused cell sometimes displays an image loaded for an older row.',
    prompt: 'Track both cell reuse and asynchronous completion.',
    cleanCode: `final class AvatarCell: UITableViewCell {
    func configure(with user: User) {
        nameLabel.text = user.name

        Task {
            avatarView.image = try await imageLoader.image(for: user.avatarURL)
        }
    }
}`,
    annotatedCode: `final class AvatarCell: UITableViewCell {
    // ⚠️ No represented ID or retained Task ties this work to the user.
    func configure(with user: User) {
        nameLabel.text = user.name

        // ⚠️ The cell may be reused before this await finishes, letting an
        // old request overwrite the new row's image.
        // Fix: cancel in prepareForReuse and verify the current user ID before set.
        Task {
            avatarView.image = try await imageLoader.image(for: user.avatarURL)
        }
    }
}`,
    fixedCode: `@MainActor
final class AvatarCell: UITableViewCell {
    private var imageTask: Task<Void, Never>?
    private var representedUserID: User.ID?

    func configure(with user: User) {
        imageTask?.cancel()
        representedUserID = user.id
        nameLabel.text = user.name
        avatarView.image = nil

        imageTask = Task { [weak self] in
            guard let imageLoader = self?.imageLoader else { return }

            do {
                let image = try await imageLoader.image(for: user.avatarURL)
                try Task.checkCancellation()
                guard let self, representedUserID == user.id else { return }
                avatarView.image = image
            } catch is CancellationError {
                return
            } catch {
                self?.avatarView.image = nil
            }
        }
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        imageTask?.cancel()
        representedUserID = nil
        avatarView.image = nil
    }
}`
  },
  {
    id: 'memory-observation-cycle',
    category: 'memory',
    categoryLabel: 'Memory',
    title: 'The controller never deinitializes',
    context: 'Closing the screen leaves its view controller and model alive.',
    prompt: 'Draw the ownership cycle created by the observation closure.',
    cleanCode: `final class DetailViewController: UIViewController {
    private let model: DetailModel
    private var observation: NSKeyValueObservation?

    func startObserving() {
        observation = model.observe(\\.title) { _, change in
            self.title = change.newValue
        }
    }
}`,
    annotatedCode: `final class DetailViewController: UIViewController {
    private let model: DetailModel
    private var observation: NSKeyValueObservation?

    func startObserving() {
        // ⚠️ self retains observation; observation retains this closure;
        // the closure strongly retains self. The cycle prevents deinit.
        // Fix: capture [weak self] and stop/invalidate observation when appropriate.
        observation = model.observe(\\.title) { _, change in
            self.title = change.newValue
        }
    }
}`,
    fixedCode: `final class DetailViewController: UIViewController {
    private let model: DetailModel
    private var observation: NSKeyValueObservation?

    func startObserving() {
        observation = model.observe(\\.title) { [weak self] _, change in
            self?.title = change.newValue
        }
    }
}`
  },
  {
    id: 'uikit-lifecycle-observer-duplication',
    category: 'uikit',
    categoryLabel: 'UIKit',
    title: 'One notification, many handlers',
    context: 'Each round trip to another screen makes the refresh handler fire one more time.',
    prompt: 'Count registrations across the view-controller lifecycle.',
    cleanCode: `override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)

    NotificationCenter.default.addObserver(
        forName: .libraryChanged,
        object: nil,
        queue: .main
    ) { [weak self] _ in
        self?.reload()
    }
}`,
    annotatedCode: `override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)

    // ⚠️ viewDidAppear can run many times, adding a new block observer each
    // time. The returned token is also discarded, so it cannot be removed.
    // Fix: register once with a retained token and remove it symmetrically,
    // or use a lifecycle-scoped observation mechanism.
    NotificationCenter.default.addObserver(
        forName: .libraryChanged,
        object: nil,
        queue: .main
    ) { [weak self] _ in
        self?.reload()
    }
}`,
    fixedCode: `final class LibraryViewController: UIViewController {
    private var libraryObserver: NSObjectProtocol?

    override func viewDidLoad() {
        super.viewDidLoad()

        libraryObserver = NotificationCenter.default.addObserver(
            forName: .libraryChanged,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.reload()
        }
    }

    deinit {
        if let libraryObserver {
            NotificationCenter.default.removeObserver(libraryObserver)
        }
    }
}`
  },
  {
    id: 'uikit-autolayout-safe-area',
    category: 'uikit',
    categoryLabel: 'UIKit',
    title: 'Ambiguous intent at the screen edges',
    context: 'The table may conflict with generated constraints and sits under system UI.',
    prompt: 'Review constraint participation and the chosen layout guide.',
    cleanCode: `view.addSubview(tableView)

NSLayoutConstraint.activate([
    tableView.topAnchor.constraint(equalTo: view.topAnchor),
    tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
    tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
    tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
])`,
    annotatedCode: `view.addSubview(tableView)

// ⚠️ A programmatically created view enables autoresizing-mask
// constraints by default. Disable that translation before adding anchors.
// Fix: tableView.translatesAutoresizingMaskIntoConstraints = false
NSLayoutConstraint.activate([
    // ⚠️ Pinning content to raw view edges can place it under bars/notches.
    // Fix: use view.safeAreaLayoutGuide when content should avoid system UI.
    tableView.topAnchor.constraint(equalTo: view.topAnchor),
    tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
    tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
    tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
])`,
    fixedCode: `view.addSubview(tableView)
tableView.translatesAutoresizingMaskIntoConstraints = false

let safeArea = view.safeAreaLayoutGuide
NSLayoutConstraint.activate([
    tableView.topAnchor.constraint(equalTo: safeArea.topAnchor),
    tableView.leadingAnchor.constraint(equalTo: safeArea.leadingAnchor),
    tableView.trailingAnchor.constraint(equalTo: safeArea.trailingAnchor),
    tableView.bottomAnchor.constraint(equalTo: safeArea.bottomAnchor)
])`
  },
  {
    id: 'uikit-dynamic-type',
    category: 'uikit',
    categoryLabel: 'UIKit',
    title: 'Text that cannot grow',
    context: 'The card looks correct at the default text size but clips at accessibility sizes.',
    prompt: 'Check font scaling, line count, and vertical constraints together.',
    cleanCode: `titleLabel.font = .systemFont(ofSize: 16, weight: .semibold)
titleLabel.numberOfLines = 1

NSLayoutConstraint.activate([
    titleLabel.heightAnchor.constraint(equalToConstant: 20)
])`,
    annotatedCode: `// ⚠️ A fixed point size does not follow the user's content-size choice.
// Fix: use preferredFont(forTextStyle:) and enable
// adjustsFontForContentSizeCategory.
titleLabel.font = .systemFont(ofSize: 16, weight: .semibold)

// ⚠️ One line plus a fixed height guarantees clipping as text grows.
// Fix: allow wrapping and constrain edges, not the label's height.
titleLabel.numberOfLines = 1

NSLayoutConstraint.activate([
    titleLabel.heightAnchor.constraint(equalToConstant: 20)
])`,
    fixedCode: `titleLabel.font = .preferredFont(forTextStyle: .headline)
titleLabel.adjustsFontForContentSizeCategory = true
titleLabel.numberOfLines = 0`
  },
  {
    id: 'uikit-diffable-identity',
    category: 'uikit',
    categoryLabel: 'UIKit',
    title: 'A title is not an identity',
    context: 'Two rows can share a title, and titles can change after editing.',
    prompt: 'Inspect what the diffable data source treats as an item identifier.',
    cleanCode: `struct Row: Hashable {
    var title: String
}

var snapshot = NSDiffableDataSourceSnapshot<Section, Row>()
snapshot.appendSections([.main])
snapshot.appendItems(rows)
dataSource.apply(snapshot)`,
    annotatedCode: `struct Row: Hashable {
    // ⚠️ Synthesized Hashable makes mutable title the identity. Duplicate
    // titles collide, and editing a title looks like delete + insert.
    // Fix: give each row a stable ID and use Row.ID as the snapshot item.
    var title: String
}

var snapshot = NSDiffableDataSourceSnapshot<Section, Row>()
snapshot.appendSections([.main])
snapshot.appendItems(rows)
dataSource.apply(snapshot)`,
    fixedCode: `struct Row: Identifiable {
    let id: UUID
    var title: String
}

var snapshot = NSDiffableDataSourceSnapshot<Section, Row.ID>()
snapshot.appendSections([.main])
snapshot.appendItems(rows.map(\\.id))
dataSource.apply(snapshot)`
  },
  {
    id: 'concurrency-actor-reentrancy',
    category: 'concurrency',
    categoryLabel: 'Concurrency',
    title: 'The invariant crosses an await',
    context: 'Two withdrawals can both pass the balance check before either subtracts.',
    prompt: 'Find the suspension point and re-check the actor state assumptions.',
    cleanCode: `actor BankAccount {
    private var balance = 100

    func withdraw(_ amount: Int) async throws {
        guard balance >= amount else { throw Error.insufficientFunds }

        try await ledger.recordWithdrawal(amount)
        balance -= amount
    }
}`,
    annotatedCode: `actor BankAccount {
    private var balance = 100

    func withdraw(_ amount: Int) async throws {
        guard balance >= amount else { throw Error.insufficientFunds }

        // ⚠️ An actor can run other work while this method is suspended.
        // The balance checked above may be different when execution resumes.
        // Fix: reserve/mutate before awaiting (with rollback if needed), or
        // revalidate after the await before committing the state transition.
        try await ledger.recordWithdrawal(amount)
        balance -= amount
    }
}`,
    fixedCode: `actor BankAccount {
    private var balance = 100

    func withdraw(_ amount: Int) async throws {
        guard balance >= amount else { throw Error.insufficientFunds }

        balance -= amount
        do {
            try await ledger.recordWithdrawal(amount)
        } catch {
            balance += amount
            throw error
        }
    }
}`
  },
  {
    id: 'concurrency-non-sendable-state',
    category: 'concurrency',
    categoryLabel: 'Concurrency',
    title: 'Detached tasks share a mutable class',
    context: 'Two tasks increment the same reference with no isolation.',
    prompt: 'Check both Sendable conformance and synchronization.',
    cleanCode: `final class Counter {
    var value = 0
}

let counter = Counter()

Task.detached { counter.value += 1 }
Task.detached { counter.value += 1 }`,
    annotatedCode: `// ⚠️ A mutable reference type is not safely Sendable by default.
final class Counter {
    var value = 0
}

let counter = Counter()

// ⚠️ Both detached tasks capture and mutate the same state concurrently.
// This is a data race; an unchecked Sendable conformance would only hide it.
// Fix: isolate the counter in an actor or use an appropriate lock/atomic type.
Task.detached { counter.value += 1 }
Task.detached { counter.value += 1 }`,
    fixedCode: `actor Counter {
    private(set) var value = 0

    func increment() {
        value += 1
    }
}

let counter = Counter()

async let first: Void = counter.increment()
async let second: Void = counter.increment()
_ = await (first, second)`
  },
  {
    id: 'reliability-swallowed-error',
    category: 'reliability',
    categoryLabel: 'Reliability',
    title: 'Failure looks like empty content',
    context: 'Offline users see an empty library with no retry or error state.',
    prompt: 'Trace what information is discarded by optional error handling.',
    cleanCode: `func loadLibrary() async {
    let response = try? await api.fetchLibrary()
    books = response?.books ?? []
    isLoading = false
}`,
    annotatedCode: `func loadLibrary() async {
    // ⚠️ try? erases the error and makes failure indistinguishable from
    // a valid nil/empty response. It also removes useful diagnostics.
    // Fix: catch deliberately, preserve the current data if appropriate, and
    // publish an error/retry state the UI can explain.
    let response = try? await api.fetchLibrary()
    books = response?.books ?? []
    isLoading = false
}`,
    fixedCode: `func loadLibrary() async {
    isLoading = true
    defer { isLoading = false }

    do {
        let response = try await api.fetchLibrary()
        books = response.books
        loadError = nil
    } catch is CancellationError {
        return
    } catch {
        loadError = error
    }
}`
  },
  {
    id: 'reliability-force-unwrap',
    category: 'reliability',
    categoryLabel: 'Reliability',
    title: 'User input becomes a crash',
    context: 'The URL comes from a text field and the request can fail for normal reasons.',
    prompt: 'Separate programmer invariants from recoverable runtime conditions.',
    cleanCode: `func importDocument(from input: String) {
    let url = URL(string: input)!
    let data = try! Data(contentsOf: url)
    documents.append(parse(data))
}`,
    annotatedCode: `func importDocument(from input: String) {
    // ⚠️ User input is not a guaranteed invariant; malformed text can
    // make URL(string:) return nil. Validate and show a useful error instead.
    let url = URL(string: input)!

    // ⚠️ I/O can fail because of networking, permissions, or cancellation.
    // try! converts every recoverable failure into a process crash.
    // Fix: use do/catch (prefer async networking for remote URLs) and report state.
    let data = try! Data(contentsOf: url)
    documents.append(parse(data))
}`,
    fixedCode: `enum ImportError: Error {
    case invalidURL
    case invalidResponse
}

func importDocument(from input: String) async throws {
    guard let url = URL(string: input) else {
        throw ImportError.invalidURL
    }

    let (data, response) = try await URLSession.shared.data(from: url)
    guard let http = response as? HTTPURLResponse,
          (200..<300).contains(http.statusCode) else {
        throw ImportError.invalidResponse
    }

    documents.append(parse(data))
}`
  },
  {
    id: 'accessibility-icon-tap-target',
    category: 'accessibility',
    categoryLabel: 'Accessibility',
    title: 'A button that is not a button',
    context: 'VoiceOver announces only “trash”, and the hit target is difficult to tap.',
    prompt: 'Review semantics, accessible name, and target size.',
    cleanCode: `Image(systemName: "trash")
    .frame(width: 24, height: 24)
    .onTapGesture {
        deleteItem()
    }`,
    annotatedCode: `// ⚠️ An image plus onTapGesture lacks native button semantics,
// keyboard behavior, and a clear action label.
// Fix: use Button with an explicit “Delete item” accessibility label.
Image(systemName: "trash")
    // ⚠️ A 24×24 hit area is too small for a comfortable touch target.
    // Fix: preserve the small glyph but provide about a 44×44 tappable area.
    .frame(width: 24, height: 24)
    .onTapGesture {
        deleteItem()
    }`,
    fixedCode: `Button(action: deleteItem) {
    Image(systemName: "trash")
        .frame(width: 24, height: 24)
        .frame(minWidth: 44, minHeight: 44)
        .contentShape(Rectangle())
}
.accessibilityLabel("Delete item")`
  },
  {
    id: 'concurrency-task-owner-cycle',
    category: 'memory',
    categoryLabel: 'Memory',
    title: 'A long-lived task owns its owner',
    context: 'The monitor stores a task consuming an endless stream and never deinitializes.',
    prompt: 'Follow the strong references for the entire async loop.',
    cleanCode: `final class StatusMonitor {
    private var task: Task<Void, Never>?

    func start() {
        task = Task { [weak self] in
            guard let self else { return }

            for await status in statusStream {
                self.latestStatus = status
            }
        }
    }
}`,
    annotatedCode: `final class StatusMonitor {
    // ⚠️ The owner strongly retains the task.
    private var task: Task<Void, Never>?

    func start() {
        task = Task { [weak self] in
            // ⚠️ This guard promotes self once and keeps it strong for the
            // entire long-lived loop: self → task → closure → self.
            // Fix: cancel the task on teardown and keep self weak per iteration,
            // or move stream consumption to an independently owned component.
            guard let self else { return }

            for await status in statusStream {
                self.latestStatus = status
            }
        }
    }
}`,
    fixedCode: `final class StatusMonitor {
    private var task: Task<Void, Never>?

    func start() {
        let stream = statusStream

        task = Task { [weak self] in
            for await status in stream {
                guard !Task.isCancelled else { break }
                self?.latestStatus = status
            }
        }
    }

    deinit {
        task?.cancel()
    }
}`
  }
]);
