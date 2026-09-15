# How to update the SNRC website

You can make every common update from GitHub's website. Open the file, click the pencil icon, make the change, and choose **Commit changes**. GitHub will rebuild the site automatically in a few minutes.

## The files most people should edit

| What you want to change | File or folder |
| --- | --- |
| Organization description, email, and social links | `_data/site.yml` |
| Navigation links | `_data/navigation.yml` |
| Executive-board profiles | `_data/officers.yml` |
| Yearly calendar and event categories | `_data/calendar.yml` |
| Historical initiatives and memorable events | `_data/archive.yml` |
| Program areas on the home page | `_data/programs.yml` |
| Overlapping home-page photos | `_data/home.yml` |
| Resource links | `_data/resources.yml` |
| Officer photos | `assets/images/officers/` |
| Gallery photos | `assets/images/gallery/` |

You normally do **not** need to edit anything in `_layouts`, `_includes`, `assets/css`, or `assets/js`. Those folders contain the site structure, reusable header/footer, styling, and behavior.

## Add or update an officer

1. Upload a portrait to `assets/images/officers/`.
2. Open `_data/officers.yml`.
3. Copy an existing officer block.
4. Replace `name`, `role`, `image`, `bio`, and `email`.
5. Commit the change.

Example:

```yaml
- name: Full Name
  role: President
  image: /assets/images/officers/full-name.jpg
  bio: A concise one- or two-sentence biography.
  email: netid@cornell.edu
```

If no headshot is ready, use `image: ""`. The site will show the person's initial instead.

## Add an event

Open `_data/calendar.yml`, copy an event block, and replace the values. The site compares `date` with today's date, so it automatically chooses the next event and knows which events have passed. Do not update a status manually. Adding an event dated in a new year automatically adds that year to the calendar.

```yaml
- title: Event Name
  date: 2026-10-01
  time: 5:00–6:00 p.m.
  location: Location
  category: fieldwork
  description: A short description that helps someone decide to attend.
  link: https://cornell.campusgroups.com/...
  image: ""
```

Leave `link: ""` blank if there is no registration or information page.

Choose a category key already listed at the top of `_data/calendar.yml`: `fieldwork`, `service`, `advocacy`, `education`, or `community`. To add or recolor a category, edit the `categories` list in that same file. Its label and color appear everywhere automatically.

## Add gallery photos

1. Open `assets/images/gallery/`.
2. Create a folder named for the year and event, such as `2026-fall-creek-hike`.
3. Upload the photos and commit them.

No gallery list needs to be edited. The Gallery page finds supported image files automatically. Descriptive filenames create better image descriptions for accessibility.

To feature a gallery image in the overlapping home-page collage, open `_data/home.yml` and replace an existing `image`, `alt`, and `caption`. Keep the four `position` values—`back`, `right`, `left`, and `front`—so the photos retain their layered arrangement.

## Add something to the SNRC Archive

Open `_data/archive.yml`, copy one complete entry, paste it at the top of the list, and replace its values:

```yaml
- title: Initiative or Event Name
  period: October 2026
  category: Service & Fieldwork
  description: What SNRC did, why it mattered, and any useful result.
  partner: Partner Organization
  image: /assets/images/gallery/event-folder/photo.jpg
  link: ""
```

Use a date, season, academic year, or phrase such as `Ongoing initiative` for `period`. Leave `partner`, `image`, or `link` as `""` when they do not apply. The Archive page creates and positions the card automatically.

## Change page wording

The visible page files are in the repository root:

- `index.html` — home page
- `about.html` — about and executive board
- `events.html` — upcoming and past events
- `archive.html` — data-driven history of initiatives and events
- `gallery.html` — automatic photo gallery
- `resources.html` — resource links
- `contact.html` — contact and collaboration

The text between `---` lines at the top is page metadata used for page titles, descriptions, and search results.

## Change the design

- `_layouts/default.html` provides the shared page shell and metadata.
- `_includes/header.html` and `_includes/footer.html` are the reusable site-wide components.
- `assets/css/main.css` contains all colors, typography, spacing, and responsive styles.
- `assets/js/site.js` contains the mobile menu, gentle reveal effects, and gallery lightbox.

## If a deployment fails

1. Open the repository's **Actions** tab.
2. Select the latest **Deploy SNRC website** run.
3. Open the failed step to read the error.
4. Check the most recently edited YAML file first. Spacing matters in YAML; each nested line should use spaces, not tabs.
5. Fix the file and commit again.

## Configure a custom domain later

1. Buy or use the desired domain.
2. In the repository, open **Settings → Pages**.
3. Enter the domain under **Custom domain**.
4. Follow GitHub's displayed DNS instructions.
5. Update `url` in `_config.yml` to the full custom-domain URL and set `baseurl: ""`.

Do not add a `CNAME` file until the domain and DNS records are ready.
