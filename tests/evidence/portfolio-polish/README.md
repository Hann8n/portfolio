# Portfolio polish review evidence

Baseline: `f2893b522a29725e8eb0a285eee8f99dc9c163e6` (`origin/main`).
The homepage keeps the original compact column and exact social chip links, icons, labels, order, and sizing. Selected work pairs brief audience/contribution stories with existing project images in complete cards with consistent 16:10 artwork covers, following the owner-selected theme: “I make technology clear and give people a reason to use it.” Case-study navigation remains.

Screenshots were captured from local static HTTP previews in the installed Chromium headless browser, with fonts and images fully loaded. The `tests/` directory is excluded from Worker asset uploads by `.assetsignore`.

- Homepage: desktop (1440 × 1000) and mobile (390 × 844), before and after. Collage geometry also checked at 1440, 390, and 320 CSS pixels: all three covers share exact dimensions and the 16:10 ratio at each width.
- Case studies: after screenshots at 390 × 844.
- `checks.json`: all four pages checked at 1440, 390, and 320 CSS pixels. The 320px check used dark mode; other checks used light mode. Each passed horizontal-overflow, image-loading, single-h1, internal-link HTTP 200, JavaScript-error, and first keyboard-focus checks. This is browser emulation, not a physical-device or Safari test.
- Existing `node tests/not-found.mjs` passes with Node 24.18.0 (source/config and mocked Worker routing contracts). No Worker routing or deployment changes were made. The optional Wrangler HTTP integration checks were not run.

## Content decisions for review

- Existing Gym Tracker figures (4,000+ installs, 450 daily active users, 5.0 from 14 reviews, and historical download figures) retain their original meanings. No measurement dates or analytics evidence were available for this pass; confirm reporting periods and current values before publishing. Installs were not relabeled as people/users.
- The Yik Yak account destination was checked against public Instagram metadata, which identified “Yik Yak Virginia Tech (@yikyakvtech)” and 5,577 followers. The existing “more than 5.5k” wording is retained. The historical 8th-most-active-herd claim is existing copy and was not independently verified.
- Gym Tracker sponsorship wording now identifies an offering/tools built, with no revenue yet and a clearly marked sample advertiser. No sales or client results were added.
- Vicino work and a portrait replacement/crop are deferred. No employer materials or new work samples were published.
- Existing app-development claims were retained; a broader rewrite of how AI-assisted development is described needs owner wording and is outside this pass.

## Editorial design references

- [NN/g: Why Does a Design Look Good?](https://www.nngroup.com/articles/why-does-design-look-good/) — consistent grids, typography, padding, and image treatment informed the shared cover ratio, gutters, and caption alignment.
- [Pentagram: Pienso](https://www.pentagram.com/work/pienso) — reviewed the use of actual product/brand work alongside concise technical context.
- [Instrument: Work](https://www.instrument.com/work) — reviewed image-led project presentation and concise project framing.

Each project is one complete linked card containing both its artwork and caption, with one outer boundary and no nested image frame. Covers keep the same 16:10 canvas. Gym Tracker and Yik Yak use existing portfolio images; Orbyt uses its public brand lockup as a simpler cover. No design-reference artwork was copied. The original social chips and 25rem profile width remain intact. References were visually inspected in the installed Chromium browser; their screenshot files are not included in the repository.

Vicino remains a case-study planning item, pending confirmation of shareable deliverables and individual authorship. No Vicino page or employer materials were published.

## Orbyt image sources

- `orbyt-logotype.png`: existing public brand artwork from `https://getorbyt.com/images/orbyt-logotype.png`; SHA-256 `2865d26cd57d391e4e2daaf6eed812ef2ff3a7f4330562c504ca6d8bdaf57770`. Used as the homepage cover.
- `orbyt-web-launch.png`: browser capture of the current public `https://getorbyt.com/` at 1440 × 810, with fonts loaded and reduced motion. Leads the case study's visuals.
- `orbyt-early-launch.png`: the owner's existing 1920 × 1080 launch graphic, copied without edits. The owner requested both current and earlier work, with older work clearly labeled. The case study labels it “Earlier launch artwork, showing an earlier version of the interface.” No date was inferred.

The Orbyt source repository was read only. No app code, app deployment, or unrelated work was changed. The original social-chip markup remains exact.
