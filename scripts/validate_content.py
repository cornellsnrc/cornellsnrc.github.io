#!/usr/bin/env python3
"""Validate editor-managed SNRC content before GitHub Pages deployment."""

from __future__ import annotations

import datetime as dt
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import yaml


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "_data"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
HEX_COLOR = re.compile(r"^#[0-9a-fA-F]{6}$")
SAFE_PATH = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SAFE_KEY = re.compile(r"^[a-z0-9]+(?:[-_][a-z0-9]+)*$")
EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
errors: list[tuple[str, str]] = []


def fail(file: Path | str, message: str) -> None:
    try:
        label = Path(file).relative_to(ROOT).as_posix()
    except (ValueError, TypeError):
        label = str(file)
    errors.append((label, message))


def load_yaml(name: str, expected_type: type, default=None):
    path = DATA / name
    try:
        value = yaml.safe_load(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(path, "File is missing.")
        return default
    except yaml.YAMLError as error:
        mark = getattr(error, "problem_mark", None)
        location = f" near line {mark.line + 1}" if mark else ""
        fail(path, f"YAML formatting error{location}: {getattr(error, 'problem', None) or error}")
        return default
    if not isinstance(value, expected_type):
        fail(path, f"Expected {expected_type.__name__} data, found {type(value).__name__}.")
        return default
    return value


def text(value) -> bool:
    return isinstance(value, str) and bool(value.strip())


def require(record: dict, fields: tuple[str, ...], file: Path, label: str) -> None:
    for field in fields:
        if not text(record.get(field)):
            fail(file, f"{label}: `{field}` must contain text.")


def valid_url(value: str, allow_empty: bool = True) -> bool:
    if value == "" and allow_empty:
        return True
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https", "mailto"} and bool(parsed.netloc or parsed.scheme == "mailto")


def validate_categories(categories, file: Path, label: str) -> set[str]:
    if not isinstance(categories, dict) or not categories:
        fail(file, f"`categories` must contain at least one {label} category.")
        return set()
    for key, category in categories.items():
        if not SAFE_KEY.fullmatch(str(key)):
            fail(file, f"Category key `{key}` must use lowercase letters, numbers, and underscores or hyphens.")
        if not isinstance(category, dict) or not text(category.get("label")):
            fail(file, f"Category `{key}` needs a visible `label`.")
        color = category.get("color") if isinstance(category, dict) else None
        if not isinstance(color, str) or not HEX_COLOR.fullmatch(color):
            fail(file, f"Category `{key}` color must look like `#286247`.")
    return {str(key) for key in categories}


def validate_calendar() -> None:
    file = DATA / "calendar.yml"
    data = load_yaml("calendar.yml", dict, {})
    categories = validate_categories(data.get("categories"), file, "event")
    events = data.get("events")
    if not isinstance(events, list):
        fail(file, "`events` must be a list.")
        return
    seen: set[tuple[str, str]] = set()
    for index, event in enumerate(events, 1):
        label = f"Event {index}"
        if not isinstance(event, dict):
            fail(file, f"{label} must be a YAML record.")
            continue
        require(event, ("title", "time", "location", "category", "description"), file, label)
        raw_date = event.get("date")
        try:
            event_date = raw_date if isinstance(raw_date, dt.date) else dt.date.fromisoformat(str(raw_date))
        except ValueError:
            fail(file, f"{label} `{event.get('title', '')}` date must use YYYY-MM-DD, for example `2027-04-22`.")
            event_date = None
        category = event.get("category")
        if category not in categories:
            fail(file, f"{label} `{event.get('title', '')}` uses unknown category `{category}`.")
        link = event.get("link", "")
        if not valid_url(link):
            fail(file, f"{label} `{event.get('title', '')}` link must be blank or a complete http/https URL.")
        key = (str(event.get("title", "")).strip().lower(), str(event_date))
        if key in seen:
            fail(file, f"Duplicate event: `{event.get('title', '')}` on {event_date}.")
        seen.add(key)


def validate_archive() -> None:
    file = DATA / "archive.yml"
    data = load_yaml("archive.yml", dict, {})
    categories = validate_categories(data.get("categories"), file, "archive")
    records = data.get("records")
    if not isinstance(records, list):
        fail(file, "`records` must be a list.")
        return
    seen: set[tuple[str, str]] = set()
    for index, record in enumerate(records, 1):
        label = f"Archive record {index}"
        if not isinstance(record, dict):
            fail(file, f"{label} must be a YAML record.")
            continue
        require(record, ("title", "period", "category", "description"), file, label)
        year = record.get("year")
        if not (isinstance(year, int) and 1900 <= year <= 2200) and year not in {"Ongoing", "Legacy"}:
            fail(file, f"{label} `{record.get('title', '')}` year must be four digits, `Ongoing`, or `Legacy`.")
        if record.get("category") not in categories:
            fail(file, f"{label} `{record.get('title', '')}` uses unknown category `{record.get('category')}`.")
        if not valid_url(record.get("link", "")):
            fail(file, f"{label} `{record.get('title', '')}` link must be blank or a complete http/https URL.")
        key = (str(record.get("title", "")).strip().lower(), str(year))
        if key in seen:
            fail(file, f"Duplicate archive record: `{record.get('title', '')}` ({year}).")
        seen.add(key)


def validate_albums() -> None:
    file = DATA / "albums.yml"
    albums = load_yaml("albums.yml", list, [])
    gallery = ROOT / "assets/images/gallery"
    seen: set[str] = set()
    album_paths: set[str] = set()
    for index, album in enumerate(albums, 1):
        label = f"Album {index}"
        if not isinstance(album, dict):
            fail(file, f"{label} must be a YAML record.")
            continue
        require(album, ("name", "path"), file, label)
        path = album.get("path")
        year = album.get("year")
        if not isinstance(year, int) or not 1900 <= year <= 2200:
            fail(file, f"{label} `{album.get('name', '')}` year must be four digits.")
        if not isinstance(path, str) or not SAFE_PATH.fullmatch(path):
            fail(file, f"{label} path must use lowercase letters, numbers, and hyphens.")
            continue
        if path in seen:
            fail(file, f"Duplicate album path: `{path}`.")
        seen.add(path)
        album_paths.add(path)
        folder = gallery / path
        images = [item for item in folder.iterdir() if item.is_file() and item.suffix.lower() in IMAGE_EXTENSIONS] if folder.is_dir() else []
        if not folder.is_dir():
            fail(file, f"Album `{album.get('name', '')}` is missing folder `assets/images/gallery/{path}`.")
        elif not images:
            fail(file, f"Album `{album.get('name', '')}` does not contain any supported images.")

    actual_folders = {item.name for item in gallery.iterdir() if item.is_dir()} if gallery.is_dir() else set()
    for folder in sorted(actual_folders - album_paths):
        fail(gallery / folder, "Gallery folder has no matching record in `_data/albums.yml`.")
    for item in gallery.iterdir() if gallery.is_dir() else []:
        if item.is_file() and item.suffix.lower() in IMAGE_EXTENSIONS:
            fail(item, "Gallery images must be inside an album folder generated by the private archive.")


def validate_officers() -> None:
    file = DATA / "officers.yml"
    officers = load_yaml("officers.yml", list, [])
    seen: set[str] = set()
    for index, officer in enumerate(officers, 1):
        label = f"Officer {index}"
        if not isinstance(officer, dict):
            fail(file, f"{label} must be a YAML record.")
            continue
        require(officer, ("name", "role", "bio"), file, label)
        name = str(officer.get("name", "")).strip()
        if name.lower() in seen:
            fail(file, f"Duplicate officer name: `{name}`.")
        seen.add(name.lower())
        email = officer.get("email", "")
        if email and (not isinstance(email, str) or not EMAIL.fullmatch(email)):
            fail(file, f"{label} `{name}` email is not valid.")
        image = officer.get("image", "")
        if image:
            if not isinstance(image, str) or Path(image).name != image:
                fail(file, f"{label} `{name}` image must contain only a filename, not a folder path.")
            elif Path(image).suffix.lower() not in IMAGE_EXTENSIONS:
                fail(file, f"{label} `{name}` image must be JPG, PNG, WebP, or AVIF.")
            elif not (ROOT / "assets/images/officers" / image).is_file():
                fail(file, f"{label} `{name}` references missing image `assets/images/officers/{image}`.")


def validate_home() -> None:
    file = DATA / "home.yml"
    data = load_yaml("home.yml", dict, {})
    photos = data.get("join_photos")
    if not isinstance(photos, list) or len(photos) != 4:
        fail(file, "`join_photos` must contain exactly four photographs.")
        return
    expected = {"back", "right", "left", "front"}
    positions: set[str] = set()
    for index, photo in enumerate(photos, 1):
        label = f"Home photo {index}"
        if not isinstance(photo, dict):
            fail(file, f"{label} must be a YAML record.")
            continue
        require(photo, ("image", "alt", "caption", "position"), file, label)
        image = photo.get("image")
        if isinstance(image, str) and Path(image).name == image:
            if not (ROOT / "assets/images/branding/home" / image).is_file():
                fail(file, f"{label} references missing image `assets/images/branding/home/{image}`.")
        else:
            fail(file, f"{label} `image` must contain only a filename.")
        positions.add(str(photo.get("position", "")))
    if positions != expected:
        fail(file, "Home-photo positions must be exactly: back, right, left, and front.")


def validate_simple_lists() -> None:
    navigation = load_yaml("navigation.yml", list, [])
    seen_urls: set[str] = set()
    for index, item in enumerate(navigation, 1):
        if not isinstance(item, dict):
            fail(DATA / "navigation.yml", f"Navigation item {index} must be a YAML record.")
            continue
        require(item, ("label", "url"), DATA / "navigation.yml", f"Navigation item {index}")
        url = item.get("url", "")
        if url in seen_urls:
            fail(DATA / "navigation.yml", f"Duplicate navigation URL: `{url}`.")
        seen_urls.add(url)

    programs = load_yaml("programs.yml", list, [])
    for index, program in enumerate(programs, 1):
        if not isinstance(program, dict):
            fail(DATA / "programs.yml", f"Program {index} must be a YAML record.")
            continue
        require(program, ("season", "title", "summary"), DATA / "programs.yml", f"Program {index}")
        if not isinstance(program.get("topics"), list) or not program.get("topics") or not all(text(topic) for topic in program.get("topics", [])):
            fail(DATA / "programs.yml", f"Program {index} needs at least one text item under `topics`.")

    resources = load_yaml("resources.yml", list, [])
    for group_index, group in enumerate(resources, 1):
        if not isinstance(group, dict) or not text(group.get("category")) or not isinstance(group.get("items"), list):
            fail(DATA / "resources.yml", f"Resource group {group_index} needs a category and an `items` list.")
            continue
        for item_index, item in enumerate(group["items"], 1):
            label = f"Resource group {group_index}, item {item_index}"
            if not isinstance(item, dict):
                fail(DATA / "resources.yml", f"{label} must be a YAML record.")
                continue
            require(item, ("title", "description", "url"), DATA / "resources.yml", label)
            if not valid_url(item.get("url", ""), allow_empty=False):
                fail(DATA / "resources.yml", f"{label} URL must be a complete http/https URL.")


def validate_site() -> None:
    file = DATA / "site.yml"
    data = load_yaml("site.yml", dict, {})
    organization = data.get("organization")
    if not isinstance(organization, dict):
        fail(file, "`organization` must be a YAML record.")
    else:
        require(organization, ("name", "short_name", "university", "email", "tagline", "description", "mission", "goals"), file, "Organization")
        if organization.get("email") and not EMAIL.fullmatch(str(organization["email"])):
            fail(file, "Organization email is not valid.")
    links = data.get("links")
    if not isinstance(links, dict) or not links:
        fail(file, "`links` must contain the organization links.")
    else:
        for name, url in links.items():
            if not valid_url(url, allow_empty=False):
                fail(file, f"Organization link `{name}` must be a complete http/https URL.")


def validate_image_locations() -> None:
    image_root = ROOT / "assets/images"
    allowed = {"branding", "gallery", "officers"}
    for item in image_root.iterdir():
        if item.name not in allowed:
            fail(item, "Images must live under `branding`, `gallery`, or `officers`.")
    if (image_root / "brand").exists():
        fail(image_root / "brand", "Use `assets/images/branding`, not the retired `brand` folder.")
    for area in (image_root / "gallery", image_root / "officers"):
        for image in area.rglob("*") if area.exists() else []:
            if image.is_file() and image.suffix.lower() in IMAGE_EXTENSIONS and image.stat().st_size > 2 * 1024 * 1024:
                fail(image, "Public image is larger than 2 MB; check that image optimization ran.")


def main() -> None:
    validate_site()
    validate_calendar()
    validate_archive()
    validate_albums()
    validate_officers()
    validate_home()
    validate_simple_lists()
    validate_image_locations()

    if errors:
        print(f"Content validation failed with {len(errors)} problem(s):", file=sys.stderr)
        for file, message in errors:
            print(f"- {file}: {message}", file=sys.stderr)
            if os.getenv("GITHUB_ACTIONS") == "true":
                escaped = message.replace("%", "%25").replace("\r", "%0D").replace("\n", "%0A")
                print(f"::error file={file}::{escaped}")
        raise SystemExit(1)

    print("Content validation passed: data, image references, categories, dates, and storage rules are valid.")


if __name__ == "__main__":
    main()
