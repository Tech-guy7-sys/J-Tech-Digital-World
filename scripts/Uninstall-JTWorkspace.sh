#!/usr/bin/env bash
set -euo pipefail
app="${1:-}"
case "$app" in
  jt-ai-agent) label="JT AI Agent" ;;
  jt-ai-core) label="JT AI Core" ;;
  jt-app-manager) label="JT App Manager" ;;
  jt-cloud) label="JT Cloud" ;;
  jt-code) label="JT Code" ;;
  jt-design) label="JT Design" ;;
  jt-motion) label="JT Motion" ;;
  jt-studio) label="JT Studio" ;;
  jt-stream) label="JT Stream" ;;
  *) echo "Usage: $0 <jt-ai-agent|jt-ai-core|jt-app-manager|jt-cloud|jt-code|jt-design|jt-motion|jt-studio|jt-stream>"; exit 2 ;;
esac
echo "Uninstall $label"
echo "This helper does not deliberately delete your project files or browser data."
read -r -p "Continue? Type UNINSTALL: " confirm
[[ "$confirm" == "UNINSTALL" ]] || { echo "Cancelled."; exit 0; }

case "$(uname -s)" in
  Darwin)
    home_app="$HOME/Applications/$label.app"
    system_app="/Applications/$label.app"
    [[ -e "$home_app" ]] && rm -rf "$home_app"
    if [[ -e "$system_app" ]]; then
      echo "A system-wide app was found at $system_app."
      read -r -p "Remove this app from /Applications using sudo? Type REMOVE: " system_confirm
      if [[ "$system_confirm" == "REMOVE" ]]; then sudo rm -rf "$system_app"; else echo "Left system-wide app in place."; fi
    fi
    ;;
  Linux)
    if command -v dpkg-query >/dev/null && dpkg-query -W -f='${Status}' "$app" 2>/dev/null | grep -q "install ok installed"; then
      sudo apt-get remove -y "$app"
    elif command -v rpm >/dev/null && rpm -q "$app" >/dev/null 2>&1; then
      if command -v dnf >/dev/null; then sudo dnf remove -y "$app"; else sudo zypper remove -y "$app"; fi
    fi
    rm -rf "$HOME/.local/opt/$app" "$HOME/.local/opt/$app.AppImage"
    if [[ -L "$HOME/.local/bin/$app" ]]; then rm "$HOME/.local/bin/$app"; fi
    ;;
  *) echo "This helper supports macOS and Linux. Use Windows Settings > Apps or the PowerShell uninstaller on Windows."; exit 2 ;;
esac
echo "Uninstall step finished. Check your application launcher. User-created files outside the app install location were not intentionally removed."
