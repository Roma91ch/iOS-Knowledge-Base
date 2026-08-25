# iOS Knowledge Base

A static, mobile-first personal learning hub for Swift, iOS and Mobile System Design.

## Included modules

- `modules/swift-concurrency/` — Swift Concurrency Visual Explorer V2
- `modules/combine/` — Combine Visual Explorer V3.4
- `modules/mobile-system-design/` — Mobile System Design Playbook, Hotel / Reservation App case study
- `modules/clean-architecture/` — Clean Architecture for Swift/iOS, including Domain/Data/Presentation boundaries, MVVM, SwiftUI Model–View and migration guidance

## Run locally

No build step is required. Open `index.html` directly, or serve the folder with any static server.

Example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy with GitHub Pages

1. Create a repository named `ios-knowledge-base` (or any name you prefer).
2. Upload the contents of this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then Save.

All links are relative, so the site works both at a custom domain and at a GitHub Pages project URL such as `https://username.github.io/ios-knowledge-base/`.

## Adding a new topic

Create a new folder under `modules/<topic>/` containing an `index.html`, then add one card to the root `index.html`.

The root landing page has its own shared CSS/JS. Existing learning pages stay standalone so they can preserve their custom visual interactions.
