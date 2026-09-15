# Cornell SNRC website

Official website source for Cornell University's Society for Natural Resources Conservation.

The site uses Jekyll, reusable layouts, and simple YAML data files so future officers can update content without touching the design. See [`HOW_TO_UPDATE_THE_WEBSITE.md`](HOW_TO_UPDATE_THE_WEBSITE.md) for step-by-step instructions.

## Structure

```text
_data/                  Editable organization content
_includes/              Shared header, footer, and event card
_layouts/               Shared HTML page shell
assets/css/             Site-wide styling
assets/js/              Site-wide behavior
assets/images/brand/    Logos and banner artwork
assets/images/officers/ Officer headshots
assets/images/gallery/  Automatically displayed gallery photos
*.html                  Individual pages
```

## Local preview

Install Ruby and Bundler, then run:

```bash
bundle install
bundle exec jekyll serve
```

Open `http://localhost:4000/snrc-website/`.

## Deployment

Every push to `main` runs `.github/workflows/deploy-pages.yml`, builds the Jekyll site, and deploys it to GitHub Pages.
