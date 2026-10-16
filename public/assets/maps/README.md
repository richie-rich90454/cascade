# Cascade historical map data

The world snapshots in this directory are adapted from the **Historical Basemaps** project by Alexander Ourednik and contributors: <https://github.com/aourednik/historical-basemaps>.

The source project is distributed under the GNU General Public License v3.0; its license text is included as `UPSTREAM-LICENSE.txt`. Each snapshot is a historical approximation, and the source project documents varying boundary precision. Treat these maps as teaching aids and cross-check disputed borders against primary sources and current scholarship.

`../svg/world_map_<year>.svg` is generated from the corresponding GeoJSON with `pnpm run generate:maps`. The playable named locations are separately anchored in `src/data/WorldProvinceGeography.ts`; those points identify scenario locations and are not province boundary data.
