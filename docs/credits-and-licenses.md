# Credits and licenses

This document records third-party data, references, artwork, and software used by Cascade. It supplements the source attribution shown in the game and the notices shipped alongside assets.

## Geographic data and map assets

Historical country-boundary data is adapted from [Historical Basemaps](https://github.com/aourednik/historical-basemaps) by Alexander Ourednik and contributors. The project identifies its data as GNU General Public License, version 3.0 (GPL-3.0). The adapted GeoJSON snapshots are in [`public/assets/maps/`](../public/assets/maps/), and the SVG maps are generated from those snapshots. The full upstream GPL-3.0 text is included at [`public/assets/maps/UPSTREAM-LICENSE.txt`](../public/assets/maps/UPSTREAM-LICENSE.txt). Historical boundaries are approximate and their precision varies by place and period.

## Original artwork

The title-screen atlas illustration, [`cascade-world-atlas-hero.png`](../public/assets/cascade-world-atlas-hero.png), was generated specifically for Cascade with OpenAI image generation. It is original generated artwork for this project, not a copied historical map or photograph. OpenAI's [Terms of Use](https://openai.com/policies/terms-of-use/) state that, as between the user and OpenAI and to the extent permitted by law, the user owns the output.

## Curriculum reference

Unit 7 coverage is aligned to the [AP World History: Modern Course and Exam Description, effective Fall 2026](https://apcentral.collegeboard.org/media/pdf/ap-world-history-modern-course-and-exam-description-effective-fall-2026.pdf). The CED is a reference for curriculum alignment; it is not bundled into the game. The College Board's [trademark guidelines](https://privacy.collegeboard.org/copyright-trademark/guidelines) provide the AP trademark notice used in the game.

**AP® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this website.**

## Historical texts

Source cards identify the named author, work, and date where the material is presented. Gameplay uses short excerpts, edited transcriptions, and contextual summaries. Rights in original documents, later editions, and translations can differ; no blanket license is asserted for third-party translations or editions. The game does not include scans of the historical documents. Teachers and redistributors should consult the rights holder for any edition or translation they plan to reproduce.

## Software libraries

The following direct libraries are used by the game. Their license identifiers are from the installed package metadata; the links provide the license text.

| Library                                               | Version | License                                                 |
| ----------------------------------------------------- | ------- | ------------------------------------------------------- |
| [Phaser](https://github.com/phaserjs/phaser)          | 4.2.1   | [MIT](https://spdx.org/licenses/MIT.html)               |
| [TypeScript](https://github.com/microsoft/TypeScript) | 5.9.3   | [Apache-2.0](https://spdx.org/licenses/Apache-2.0.html) |
| [Vite](https://github.com/vitejs/vite)                | 8.3.4   | [MIT](https://spdx.org/licenses/MIT.html)               |

Cascade's own application code and generated visual assets do not acquire the upstream map-data license merely by being listed here; the adapted map data and generated map files retain the notices and obligations applicable to that data.
