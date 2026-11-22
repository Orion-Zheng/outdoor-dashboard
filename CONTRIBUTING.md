# Contributing / 贡献指南

资料通过 Pull Request 审核后上线。也可以 [提交资料 Issue](https://github.com/Orion-Zheng/outdoor-dashboard/issues/new/choose)，由维护者整理。

## Small corrections / 小修改

在 GitHub 打开相关 JSON 文件，点击编辑按钮，修改后选择创建分支并提交 PR。没有写权限时 GitHub 会引导你创建 fork。更新价格、政策或联系方式时，同步更新 `reviewedAt`（`YYYY-MM-DD`），并保留对应官网来源。不要修改生成的 `dist/`。

当前数据：`data/skydiving/regions/us-ca-bay-area/`。

- `venues.json`：户外场地、联系方式、报价与政策摘要。
- `indoor.json`：室内场地与联系方式。
- `courses.json`：课程、价格、适用阶段与来源。
- `region.json`：地区名称、证照体系及出发城市快捷项。

## Information rules / 资料规则

- Text is plain text, not HTML. Bilingual fields use `{ "zh": "中文", "en": "English" }`.
- Use official HTTPS sources. Keep source links specific to the fact being supported. Clearly distinguish a short direct quotation from your paraphrase or a type-based estimate.
- Prices are numbers with an ISO currency code and clear per-person/per-jump/package units. Unknown is `null`; `false` means rental explicitly unavailable, not unknown. Do not use zero or a dash string for an unpublished price.
- `tandemPrices` lists every documented altitude and its conditions. `liftPrices` separates own-gear and rental-included prices. Do not silently drop options.
- Coordinates are `[latitude, longitude]` at the venue, not a nearby city center. Do not provide private home addresses or personal contact details.
- Do not claim a license alone grants camera/wingsuit/balloon/instructor access. Preserve jump-count, currency, equipment, endorsement and operator-review requirements.
- Only add emails, phone numbers and official websites supported by public operator information. The contact dialog has distinct actions; generic “Contact” must never directly dial.
- `operatingHours` records a sourced weekly schedule in its IANA `timeZone`; distinguish `business`, `dropzone`, `flights` and `jumping` hours. Weekday keys are `sun` through `sat`; `[]` means published closed, `null` means unknown, and intervals use `open`/`close` in `HH:MM`. Office hours must not be presented as verified jump times. Weather planning intersects these hours with sunrise/sunset; it never confirms current opening.
- Never infer an observed cloud ceiling from modeled cloud percentage. A weather comparison is not jump clearance.
- For media, provide source, creator, license and permission for redistribution. Prefer a linked video over copying a video file. Existing media must retain credits.

## Add a venue / 新增基地

Copy a nearby venue entry and replace every operator-specific fact, source and ID. IDs must be unique across regions. Include required metadata and both price arrays (which may be empty); use `null` for unknown facts. `minimum: null` means unverified minimum, not unrestricted access. Set `affGraduateAccepted` only from documented policy. Aircraft details are not guessed: unrecognized venues show an unverified-data message until a sourced aircraft adapter is added.

For a course, `zone` must reference an outdoor venue in the same region. Current experience indices: `0` pre-AFF student, `1` AFF graduate/pre-A, `2` A, `3` B, `4` C, `5` D. `min`/`max` filter the documented audience; they do not authorize specialty participation.

## Add a region / 新增地区

1. Create `data/skydiving/regions/<stable-region-id>/` with `region.json`, `venues.json`, `courses.json`, `indoor.json`.
2. Add that region ID under skydiving in `data/catalog.json`.
3. Use the region ID in every venue entry. Country/subdivision labels are venue data; avoid hard-coded Bay Area assumptions.
4. Populate region-specific city shortcuts. Do not add East Bay/South Bay-style filters for the current small catalog.
5. The current qualification adapter is USPA. A new region using a different system must implement and verify that progression model before publishing. Do not map a foreign rating to a USPA letter by guesswork.

## Add another sport / 新增运动

`scuba-diving` and `skiing` are marked `planned` and are not exposed as empty navigation tabs. A new active sport needs its own UI, qualification model, venue schema, conditions assessment, sources and tests. Reuse location/contact/source components where appropriate; keep skydiving safety rules specific to skydiving.

## Verify / 验证

```sh
npm ci --ignore-scripts
npm run check
npm run build
npm run preview
```

For UI changes, include a screenshot and test narrow and wide layouts. Check the GitHub Pages `/outdoor-dashboard/` path, not just `/`. For factual changes, the maintainer reviews source quality in addition to the automated format checks.

## Review and publication / 审核与发布

Open a PR against `main`; fill out the PR template. The maintainer is requested through CODEOWNERS. The `validate` check must pass. After the maintainer approves and merges, GitHub Actions updates Pages automatically. Opening a PR does not publish its contents.

Project code contributions follow the MIT license. Third-party media and quotations retain their original rights and must be clearly identified.
