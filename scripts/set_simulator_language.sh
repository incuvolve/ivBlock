#!/usr/bin/env bash
# set_simulator_language.sh <language-code> <locale>
# Example: ./set_simulator_language.sh de-DE de_DE
set -euo pipefail
LANG_CODE=${1:-de-DE}
LOCALE=${2:-de_DE}

SIMCTL=$(xcrun --find simctl)
# Prefer any currently booted device
UDID=$($SIMCTL list devices booted | awk -F '[()]' 'NR==1{print $2}')

# If none booted, prefer the first available iPhone simulator for a recent runtime
if [ -z "$UDID" ]; then
  UDID=$($SIMCTL list devices available | awk -F '[()]' '/iPhone/ {gsub(/.*\(|\).*/,"",$2); print $2; exit}')
fi

# Fallback: first iPhone in the full list
if [ -z "$UDID" ]; then
  UDID=$($SIMCTL list devices | awk -F '[()]' '/iPhone/ {gsub(/.*\(|\).*/,"",$2); print $2; exit}')
fi

if [ -z "$UDID" ]; then
  echo "ERROR: No iOS simulator UDID found via simctl." >&2
  exit 1
fi

PLIST="$HOME/Library/Developer/CoreSimulator/Devices/$UDID/data/Library/Preferences/.GlobalPreferences.plist"

if [ ! -f "$PLIST" ] && [ ! -d "$(dirname "$PLIST")" ]; then
  echo "ERROR: Simulator device path not found for UDID $UDID" >&2
  exit 1
fi

# Shutdown to ensure preference changes take effect
$SIMCTL shutdown "$UDID" 2>/dev/null || true
sleep 1

PB=/usr/libexec/PlistBuddy
# Remove existing AppleLanguages (ignore errors), then set array with desired language
$PB -c "Delete :AppleLanguages" "$PLIST" 2>/dev/null || true
$PB -c "Add :AppleLanguages array" "$PLIST" || true
$PB -c "Add :AppleLanguages:0 string $LANG_CODE" "$PLIST" || true

# Set or add AppleLocale
$PB -c "Set :AppleLocale $LOCALE" "$PLIST" 2>/dev/null || $PB -c "Add :AppleLocale string $LOCALE" "$PLIST"

# Boot the device and wait until fully booted
$SIMCTL boot "$UDID" || true
# Wait for boot to finish (bootstatus returns 0 when booted)
if command -v xcrun >/dev/null 2>&1; then
  xcrun simctl bootstatus "$UDID" -b 2>/dev/null || true
fi

echo "Simulator $UDID set to $LANG_CODE / $LOCALE and booted"
exit 0
