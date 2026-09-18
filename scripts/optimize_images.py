#!/usr/bin/env python3
"""Resize and compress user-managed website photos in place."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError


ROOT = Path(__file__).resolve().parents[1]
CACHE_PATH = ROOT / ".image-optimization.json"
PHOTO_AREAS = {
    ROOT / "assets/images/gallery": 2200,
    ROOT / "assets/images/officers": 1200,
}
SUPPORTED = {".jpg", ".jpeg", ".png", ".webp"}


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def load_cache() -> dict[str, str]:
    try:
        data = json.loads(CACHE_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def write_optimized(image: Image.Image, suffix: str, destination: Path) -> None:
    if suffix in {".jpg", ".jpeg"}:
        if image.mode not in {"RGB", "L"}:
            background = Image.new("RGB", image.size, "white")
            if image.mode in {"RGBA", "LA"}:
                background.paste(image, mask=image.getchannel("A"))
            else:
                background.paste(image.convert("RGB"))
            image = background
        image.save(destination, format="JPEG", quality=82, optimize=True, progressive=True)
    elif suffix == ".png":
        image.save(destination, format="PNG", optimize=True, compress_level=9)
    elif suffix == ".webp":
        image.save(destination, format="WEBP", quality=82, method=6)


def optimize(path: Path, max_dimension: int) -> tuple[bool, str]:
    original_size = path.stat().st_size
    temporary = path.with_name(f".{path.name}.optimizing")

    try:
         with Image.open(path) as source:
            if getattr(source, "is_animated", False):
                if path.suffix.lower() in {".jpg", ".jpeg"}:
                    source.seek(0)
                else:
                    return False, "animated image skipped"

            image = ImageOps.exif_transpose(source)
            original_dimensions = image.size
            image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            resized = image.size != original_dimensions
            write_optimized(image, path.suffix.lower(), temporary)

        optimized_size = temporary.stat().st_size
        if resized or optimized_size < original_size:
            os.replace(temporary, path)
            reduction = 100 * (original_size - optimized_size) / original_size
            return True, f"{original_size:,} → {optimized_size:,} bytes ({reduction:.1f}% smaller)"

        temporary.unlink(missing_ok=True)
        return False, "already compact"
    except (UnidentifiedImageError, OSError, ValueError) as error:
        temporary.unlink(missing_ok=True)
        return False, f"skipped: {error}"


def main() -> None:
    old_cache = load_cache()
    new_cache: dict[str, str] = {}
    changed = 0

    for directory, max_dimension in PHOTO_AREAS.items():
        if not directory.exists():
            continue

        for path in sorted(directory.rglob("*")):
            if not path.is_file() or path.suffix.lower() not in SUPPORTED:
                continue

            relative = path.relative_to(ROOT).as_posix()
            current_digest = digest(path)
            if (
                old_cache.get(relative) == current_digest
                and path.stat().st_size <= 2 * 1024 * 1024
            ):
                new_cache[relative] = current_digest
                continue

            was_changed, message = optimize(path, max_dimension)
            print(f"{relative}: {message}")
            changed += int(was_changed)
            new_cache[relative] = digest(path)

    CACHE_PATH.write_text(
        json.dumps(new_cache, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"Optimized {changed} image(s).")


if __name__ == "__main__":
    main()
