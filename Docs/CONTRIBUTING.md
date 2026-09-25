# Contributing to Nativ docs

## Page structure

- Lead with the outcome in one short paragraph.
- Put prerequisites in **Before you start**.
- Use numbered H2 headings for task sequences and plain H2 headings for reference sections.
- Link to the next logical guide before the page ends.
- Keep one user goal per page.

## Screenshots

- Store images under `public/assets/<section>/<page>/`.
- Name captures in reading order: `01-action-state.png`, `02-action-state.png`.
- Capture at Retina resolution with no visible pointer, selection, notification, or unrelated window.
- Crop to the smallest area that preserves orientation and shows the result of the action.
- Use realistic content and a completed state; do not document empty placeholder screens.
- Use `{% image %}` for ordinary screenshots and `{% annotatedimage %}` only when a reader must locate several controls.
- Every image requires specific alt text and a caption that explains why the state matters.
- Keep numbered annotation badges in a consistent outer rail and align each badge with the center of its target.

## Important guidance

- Keep guidance in the relevant paragraph or under a clear heading instead of a boxed callout.
- Lead irreversible actions, incompatible settings, and broad resets with a short bold warning.
- State restart requirements next to the setting they affect.

## Verification

Run the complete documentation check before handing off a change:

```sh
npm run build
```

The build generates raw Markdown, text, the search index, and `llms.txt`; checks links, navigation routes, image metadata, assets, and stale generated files; then creates the static site.
