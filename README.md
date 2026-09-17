# Cornell SNRC website editor

This repository publishes the official website for Cornell University's Society for Natural Resources Conservation.

## Choose what you want to update

You can complete every routine website update in your browser. You do **not** need to install Git, use a terminal, or understand programming.

| I want to… | Open this |
| --- | --- |
| Add photos to an existing gallery album | [Open gallery folders](https://github.com/mn579/snrc-website/tree/main/assets/images/gallery) |
| Create, rename, or reorder a gallery album | [Edit album information](https://github.com/mn579/snrc-website/edit/main/_data/albums.yml) |
| Upload an officer headshot | [Upload officer photos](https://github.com/mn579/snrc-website/upload/main/assets/images/officers) |
| Add or update an officer | [Edit officer profiles](https://github.com/mn579/snrc-website/edit/main/_data/officers.yml) |
| Add or update a calendar event | [Edit the event calendar](https://github.com/mn579/snrc-website/edit/main/_data/calendar.yml) |
| Add an item to the SNRC Archive | [Edit archive records](https://github.com/mn579/snrc-website/edit/main/_data/archive.yml) |
| Update home-page photos | [Edit home-page content](https://github.com/mn579/snrc-website/edit/main/_data/home.yml) |
| Update programs or focus areas | [Edit program information](https://github.com/mn579/snrc-website/edit/main/_data/programs.yml) |
| Update resource links | [Edit resources](https://github.com/mn579/snrc-website/edit/main/_data/resources.yml) |
| Update contact details or social links | [Edit organization details](https://github.com/mn579/snrc-website/edit/main/_data/site.yml) |
| Read complete instructions | [Open the website editing guide](HOW_TO_UPDATE_THE_WEBSITE.md) |
| Check whether an update published successfully | [View website Actions](https://github.com/mn579/snrc-website/actions) |
| View the published website | [Open the SNRC website](https://mn579.github.io/snrc-website/) |

## The only GitHub button you need to know

After editing a data file or uploading photos, select the green **Commit changes** button. For this website, **Commit changes means save and publish**.

Use a short description such as `Add October cleanup event` or `Upload picnic photos`. Leave the other options at their defaults and confirm the commit. The website normally updates within a few minutes.

## Quick photo instructions

### Add photos to an existing album

1. Open [the gallery folders](https://github.com/mn579/snrc-website/tree/main/assets/images/gallery).
2. Select the folder for the event.
3. Select **Add file → Upload files**.
4. Drag the photos onto the page.
5. Select **Commit changes**.

The website finds the new photos automatically. An automated workflow also reduces oversized JPG, PNG, and WebP files after upload; you do not need to resize ordinary phone photos first.

### Create a new album

1. On your computer, place the event photos in one folder. Name it with the year and event using lowercase letters and hyphens, such as `2027-fall-creek-cleanup`.
2. Open [the gallery folders](https://github.com/mn579/snrc-website/tree/main/assets/images/gallery), select **Add file → Upload files**, and drag the complete folder onto the upload page.
3. Select **Commit changes**.
4. Open [album information](https://github.com/mn579/snrc-website/edit/main/_data/albums.yml).
5. Copy an existing album entry and replace its name, year, and path. The path must exactly match the uploaded folder name:

   ```yaml
   - name: Fall Creek Cleanup
     year: 2027
     path: 2027-fall-creek-cleanup
   ```

6. Select **Commit changes** again.

For field-by-field examples and troubleshooting, use the [complete editing guide](HOW_TO_UPDATE_THE_WEBSITE.md).

## Please do not edit these folders

Routine editors should stay within `_data`, `assets/images/gallery`, and `assets/images/officers`. The following locations control the website's design and behavior:

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
