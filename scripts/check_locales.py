#!/usr/bin/env python3
"""
Check that all ivBlock/ivBlockCore/_locales/*/messages.json files have the same set of keys.
Exit codes:
 0 - all aligned
 1 - error (IO/parse)
 2 - mismatch found
"""
from pathlib import Path
import json
import sys
import argparse


def load_keys(path: Path):
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        raise RuntimeError(f"Failed to parse {path}: {e}")
    if not isinstance(data, dict):
        raise RuntimeError(f"Unexpected format in {path}: expected object at top-level")
    return set(data.keys())


def main():
    p = argparse.ArgumentParser(description="Check messages.json alignment across locales")
    default_locales = str(Path(__file__).resolve().parents[1] / "ivBlock" / "ivBlockCore" / "_locales")
    p.add_argument("--locales-dir", default=default_locales,
                   help=f"Path to _locales directory (default: {default_locales})")
    args = p.parse_args()

    locales_dir = Path(args.locales_dir)
    if not locales_dir.exists():
        print(f"ERROR: locales directory not found: {locales_dir}")
        return 1

    locale_results = {}
    for sub in sorted(locales_dir.iterdir()):
        if not sub.is_dir():
            continue
        msg_file = sub / "messages.json"
        if not msg_file.exists():
            print(f"WARNING: {sub.name} missing messages.json, skipping")
            continue
        try:
            keys = load_keys(msg_file)
        except Exception as e:
            print(f"ERROR: {e}")
            return 1
        locale_results[sub.name] = keys

    if not locale_results:
        print("ERROR: No locales with messages.json found.")
        return 1

    # Summary counts
    print("Locale counts:")
    for loc, keys in sorted(locale_results.items()):
        print(f"  {loc}: {len(keys)} keys")

    # Choose reference: prefer 'en', else the locale with the largest keyset
    ref_locale = 'en' if 'en' in locale_results else max(locale_results.keys(), key=lambda k: len(locale_results[k]))
    ref_keys = locale_results[ref_locale]
    print(f"Reference locale: {ref_locale} ({len(ref_keys)} keys)")

    ok = True
    for loc, keys in sorted(locale_results.items()):
        missing = sorted(ref_keys - keys)
        extra = sorted(keys - ref_keys)
        if missing or extra:
            ok = False
            print(f"\nDifferences for {loc}:")
            if missing:
                print(f"  Missing ({len(missing)}): {missing[:10]}{('...' if len(missing)>10 else '')}")
            if extra:
                print(f"  Extra   ({len(extra)}): {extra[:10]}{('...' if len(extra)>10 else '')}")

    if ok:
        print("\nOK: All messages.json files have the same keys.")
        return 0
    else:
        print("\nFAIL: messages.json files differ. Use the lists above to add/remove keys so they align.")
        return 2


if __name__ == '__main__':
    sys.exit(main())
