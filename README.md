# Outdoor Dashboard

Community-reviewed information about outdoor venues, training, prices and conditions. [Website](https://orion-zheng.github.io/outdoor-dashboard/) · [Contribute information](CONTRIBUTING.md) · [Report a correction](https://github.com/Orion-Zheng/outdoor-dashboard/issues/new/choose).

English is the default interface language; a language button switches to Chinese and remembers an explicit choice for the browser session.

目前收录跳伞（户外基地、室内风洞、USPA / IBA 进阶路径）。首批资料覆盖旧金山湾区及周边；项目按运动类别和地区组织，不以湾区作为全站边界。潜水、滑雪在分类目录中预留，但尚未上线。

## Contribute / 贡献资料

1. Fork the repository, edit the relevant JSON files, and open a pull request.
2. Include public sources, a verification date, both Chinese and English text, and clear units/conditions.
3. Automated checks validate the data and build the site.
4. The maintainer reviews and merges the PR. GitHub Pages publishes `main` automatically.

不熟悉 Git 也可以通过 Issue 模板提交更正；未经审核的 PR 不会发布。所有资料更改都需要来源；未知价格用 `null`，不推测基地准入或实际运营状态。详见 [贡献指南](CONTRIBUTING.md)。

## Structure

```text
data/
  catalog.json                         # sports and region registry
  skydiving/regions/us-ca-bay-area/
    region.json                        # region, certification system, origin shortcuts
    venues.json                        # outdoor DZs, sources and price rows
    indoor.json                        # indoor venues and contact details
    courses.json                       # training offers and prerequisites
site/                                  # browser UI, progression and weather modules
scripts/                               # validation, build and local preview
tests/                                 # data, routing and weather checks
.github/                               # PR/Issue templates, CODEOWNERS and Pages workflow
dist/                                  # generated output, not committed
```

A new region is another folder under its sport and an entry in `catalog.json`. IDs must be unique. Regional micro-filters (East Bay/South Bay/etc.) are deliberately absent. A region selector appears only after more than one region has been added.

The current outdoor progression UI models USPA; IBA indoor skills are separate. A region that needs another certification system requires its own progression adapter before publication. Scuba diving and skiing will likewise need their own qualification and conditions models; do not reinterpret skydiving licenses as generic levels.

## Local development

Use Node.js 22 or later.

```sh
npm ci --ignore-scripts
npm run check
npm run build
npm run preview
```

Open `http://127.0.0.1:4180/`. Rebuild after source/data edits. To verify GitHub Pages project paths locally:

```sh
BASE_PATH=/outdoor-dashboard/ npm run preview
```

Open `http://127.0.0.1:4180/outdoor-dashboard/`. Assets, data and module imports are relative to the deployed project path. The build adds a content-derived version to scripts, styles and catalog requests so a new deployment does not keep loading a cached older interface.

## Hosting and reviews

GitHub Pages serves the generated static site; no application backend or login is needed for the initial PR-based contribution process. The `Validate and deploy` workflow runs on PRs and pushes to `main`. PR jobs are read-only and do not deploy. After a reviewed merge, the build artifact is published with Pages' short-lived deployment permissions.

The repository owner is the CODEOWNER for all files. Main-branch protection requires a passing `validate` check and code-owner approval, dismisses stale approvals and blocks force pushes/deletion. The sole maintainer can use the administrator exception for their own changes because GitHub does not permit approving one's own PR. Do not give general contributors write access; use forks and PRs.

For another deployment, enable **Settings → Pages → Build and deployment → GitHub Actions**. This project does not require a Vercel account, Cloudflare account, server or secret API key. GitHub's documentation: [Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).

## Maps, routes and contact

- Road background: OpenStreetMap tiles with visible attribution. Satellite/aerial background: Esri World Imagery with service/provider credits. These are third-party map services, not redistributed local map assets. Keep their credits visible and follow their terms. See [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/) and [World Imagery metadata](https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer).
- Venue markers open the corresponding information card. Origin markers change when the starting place changes.
- After choosing an origin, a visible list beside the map shows every current venue’s driving distance and estimated time, sorted by duration; cards show the same estimate prominently. Routing is always by car, with a refresh action and explicit loading/failure states. Driving distance and duration come from the OSRM road-routing table service; they are not straight-line estimates and do not include live traffic. One origin queries all current venues in one request, caches results for 30 minutes, and spaces service requests by at least 1.1 seconds. Unreachable/unavailable routes remain explicitly unavailable. [API](https://project-osrm.org/docs/v5.24.0/api/) · [public service limits](https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server).
- Public tile/routing/geocoding services are best effort and intended here for early, modest community use. Before substantial traffic, use a hosted plan or self-hosted routing/geocoding and a suitable tile provider. The Photon public endpoint permits reasonable use with no availability guarantee; searches are explicit (no automatic keystroke requests), cached and throttled. Change `geocodingEndpoint` in `site/config.json` when moving to a managed or self-hosted Photon service. See [Photon usage and API](https://github.com/komoot/photon). Real-time traffic estimates need an appropriate traffic-enabled provider; no live-traffic claims are made here.
- Submitted search text goes to Photon (OpenStreetMap-based geocoding); five candidate locations are shown with full place labels and coordinates. No candidate is automatically selected, including a single result. Only after selection are origin/destination coordinates sent to OSRM. City shortcuts use city-center coordinates. Maps/tile providers see ordinary browser requests. The dashboard does not store submitted addresses on a project server.
- A generic contact action opens a dialog showing phone, website and address (and email when documented). The user can copy a phone number or explicitly choose **Dial number**; opening contacts does not start a phone call.

## Progression, weather and evidence

The horizontal overview and indoor/outdoor stage controls all provide explanation/video dialogs without an expandable bar obscuring results. The AFF example retains the user-selected [Teuge AFF1–7 video](https://www.youtube.com/watch?v=sc6Pmcu9rhY). Video metadata is in `site/videos.js`; sources and prerequisites remain separate from demonstrations.

Clicking a DZ's weather icon immediately fetches Open-Meteo for that venue, including seven forecast days and daily sunrise/sunset. The primary forecast is the next remaining daytime interval inside the documented weekly schedule; after sunset or a published closed day it moves to the next such interval. Published business hours are labeled separately from flight/jumping hours and do not confirm actual availability. Missing schedules use a clearly labeled daylight-only window. The next12hours including night/off-hours remain collapsed and do not drive the daytime summary.

The forecast uses a continuous wind/gust timeline with a dashed line explicitly naming the selected student/tandem/A/B/C/D reference. Risk shading and a precipitation/storm/fog strip share the time axis. Clicking or using the arrow keys changes the selected period and its details. Wind warnings name the group, value and cited source; a wind-reference match does not establish jump clearance. A current driving arrival is marked only when it falls inside the selected planning window; after-hours arrivals are explicitly labeled outside it.

Window boundaries are clipped to official hours and daylight. Details retain the underlying hourly model timestamp; precipitation and gust aggregates refer to the hour ending at that timestamp. No actual cloud-base, flight-path clearance, booking or live DZ operation is inferred.


Published prices, access policies, estimates and quotations are labeled separately. Some inherited rates are explicitly historical (e.g. SVS2023). A `reviewedAt` date records review of a source, not a guarantee that the price is current. Weather conditions and operational decisions require current local verification.

## Media and licenses

Original project code is MIT licensed. Third-party photographs, drawings, quoted excerpts and linked/embedded videos retain their respective rights; the project license does not relicense them. See [THIRD_PARTY.md](THIRD_PARTY.md).
