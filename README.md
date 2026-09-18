# Cornell SNRC website editor

This repository publishes the official website for Cornell University's Society for Natural Resources Conservation.

## Choose what you want to update

You can complete every routine website update in your browser. You do **not** need to install Git, use a terminal, or understand programming.

| I want to… | Open this |
| --- | --- |
| Upload a new gallery album | [Open the private photo archive](https://github.com/cornellsnrc/snrc-photo-archive/releases) |
| Read the gallery upload directions | [Open the archive instructions](https://github.com/cornellsnrc/snrc-photo-archive#upload-an-album) |
| Upload an officer headshot | [Upload officer photos](https://github.com/cornellsnrc/snrc-website/upload/main/assets/images/officers) |
| Add or update an officer | [Edit officer profiles](https://github.com/cornellsnrc/snrc-website/edit/main/_data/officers.yml) |
| Add or update a calendar event | [Edit the event calendar](https://github.com/cornellsnrc/snrc-website/edit/main/_data/calendar.yml) |
| Add an item to the SNRC Archive | [Edit archive records](https://github.com/cornellsnrc/snrc-website/edit/main/_data/archive.yml) |
| Update home-page photos | [Edit home-page content](https://github.com/cornellsnrc/snrc-website/edit/main/_data/home.yml) and use `assets/images/branding/home` |
| Update programs or focus areas | [Edit program information](https://github.com/cornellsnrc/snrc-website/edit/main/_data/programs.yml) |
| Update resource links | [Edit resources](https://github.com/cornellsnrc/snrc-website/edit/main/_data/resources.yml) |
| Update contact details or social links | [Edit organization details](https://github.com/cornellsnrc/snrc-website/edit/main/_data/site.yml) |
| Read complete instructions | [Open the website editing guide](HOW_TO_UPDATE_THE_WEBSITE.md) |
| Check whether an update published successfully | [View website Actions](https://github.com/cornellsnrc/snrc-website/actions) |
| View the published website | [Open the SNRC website](https://cornellsnrc.github.io/snrc-website/) |

## The only GitHub button you need to know

After editing a data file, select the green **Commit changes** button. For this website, **Commit changes means save and publish**.

Use a short description such as `Add October cleanup event` or `Upload picnic photos`. Leave the other options at their defaults and confirm the commit. The website normally updates within a few minutes.

Every update is checked before publication. If **Validate editor content** shows a red X, open that step and follow its plain-language message. The previous website remains online while the invalid update is corrected.

## Quick photo instructions

Gallery originals belong in the private photo archive—not directly in this website repository. The website receives only the optimized display copies created by the archive automation.

1. Put one event's original photographs in a folder and create a ZIP of that folder.
2. Open the private archive's [Releases page](https://github.com/cornellsnrc/snrc-photo-archive/releases).
3. Select **Draft a new release**.
4. Create a tag such as `2027-04-22--earth-day-cleanup`.
5. Enter the normal album title, attach exactly one ZIP, and select **Publish release**.

The archive preserves the original ZIP privately. Its automation creates smaller website copies, adds the Gallery card and deploys the updated site. Do not upload gallery originals directly to `assets/images/gallery`.

For field-by-field examples and troubleshooting, use the [complete editing guide](HOW_TO_UPDATE_THE_WEBSITE.md).

## Please do not edit these folders

Routine editors should stay within `_data`, `assets/images/officers`, and—only when changing permanent page artwork—`assets/images/branding`. Gallery files are managed exclusively by the private archive automation. The following locations control the website's design and behavior:

- `_includes`
- `_layouts`
- `assets/css`
- `assets/js`
- `.github`
- `scripts`

If something goes wrong, do not panic: GitHub preserves every previous version. Contact the website maintainer rather than deleting unfamiliar files.

<details>
<summary><strong>Developer information</strong></summary>

The site uses Jekyll, reusable layouts, and YAML data files. To preview it locally, install Ruby and Bundler, then run:

```bash
bundle install
bundle exec jekyll serve
```

Open `http://localhost:4000/snrc-website/`. Every push to `main` runs `.github/workflows/deploy-pages.yml` and deploys the generated site to GitHub Pages.

</details>
