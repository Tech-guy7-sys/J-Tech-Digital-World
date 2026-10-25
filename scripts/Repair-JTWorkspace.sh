#!/usr/bin/env bash
set -euo pipefail
app="${1:-}"
package="${2:-}"
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
  *) echo "Usage: $0 <jt-ai-agent|jt-ai-core|jt-app-manager|jt-cloud|jt-code|jt-design|jt-motion|jt-studio|jt-stream> <official-package-path>"; exit 2 ;;
esac
if [[ -z "$package" || ! -f "$package" ]]; then echo "Provide the path to an official downloaded installer/archive."; exit 2; fi
package="$(cd "$(dirname "$package")" && pwd)/$(basename "$package")"
ext="${package##*.}"
echo "$label repair/reinstall"
echo "This replaces application files only; it does not repair remote AI/account services or intentionally delete user data."
read -r -p "Continue with official package '$package'? Type YES: " confirm
[[ "$confirm" == "YES" ]] || { echo "Cancelled."; exit 0; }

case "$(uname -s)" in
  Darwin)
    case "$ext" in
      dmg|zip) ;;
      *) echo "macOS repair expects an official .dmg or .zip package."; exit 2 ;;
    esac
    tmp="$(mktemp -d)"
    mounted=""
    cleanup() {
      if [[ -n "$mounted" ]]; then hdiutil detach "$mounted" -quiet || true; fi
      rm -rf "$tmp"
    }
    trap cleanup EXIT
    source_dir="$tmp/unpacked"
    mkdir -p "$source_dir"
    if [[ "$ext" == "dmg" ]]; then
      mounted="$tmp/mounted"
      mkdir -p "$mounted"
      hdiutil attach "$package" -readonly -nobrowse -mountpoint "$mounted" >/dev/null
      source_dir="$mounted"
    else
      ditto -x -k "$package" "$source_dir"
    fi
    app_path="$(find "$source_dir" -maxdepth 4 -type d -name "$label.app" -print -quit)"
    [[ -n "$app_path" ]] || { echo "No $label.app bundle found in this package."; exit 1; }
    target="$HOME/Applications/$label.app"
    mkdir -p "$HOME/Applications"
    if [[ -e "$target" ]]; then rm -rf "$target"; fi
    ditto "$app_path" "$target"
    echo "Reinstalled at $target"
    ;;
  Linux)
    case "$ext" in
      AppImage)
        mkdir -p "$HOME/.local/opt" "$HOME/.local/bin"
        target="$HOME/.local/opt/$app.AppImage"
        install -m 755 "$package" "$target"
        ln -sfn "$target" "$HOME/.local/bin/$app"
        echo "Reinstalled AppImage at $target. Ensure $HOME/.local/bin is on PATH."
        ;;
      deb)
        command -v apt-get >/dev/null || { echo "This .deb package requires a Debian/Ubuntu-compatible package manager."; exit 2; }
        sudo apt-get install -y "$package"
        ;;
      rpm)
        if command -v dnf >/dev/null; then sudo dnf install -y "$package"
        elif command -v zypper >/dev/null; then sudo zypper install -y "$package"
        else echo "No supported RPM package manager (dnf/zypper) was found."; exit 2
        fi
        ;;
      zip)
        command -v unzip >/dev/null || { echo "Install unzip first."; exit 2; }
        target="$HOME/.local/opt/$app"
        mkdir -p "$HOME/.local/opt" "$HOME/.local/bin"
        tmp="$(mktemp -d)"
        trap 'rm -rf "$tmp"' EXIT
        unzip -q "$package" -d "$tmp"
        [[ -d "$target" ]] && rm -rf "$target"
        mkdir -p "$target"
        cp -R "$tmp"/. "$target"/
        executable="$(find "$target" -type f -name "$app" -print -quit)"
        if [[ -z "$executable" ]]; then executable="$(find "$target" -type f -perm -u+x ! -name "chrome-sandbox" ! -name "chrome_crashpad_handler" -print -quit)"; fi
        if [[ -n "$executable" ]]; then ln -sfn "$executable" "$HOME/.local/bin/$app"; fi
        echo "Reinstalled portable app under $target"
        ;;
      *) echo "Linux repair expects .AppImage, .deb, .rpm, or .zip."; exit 2 ;;
    esac
    ;;
  *) echo "This repair helper supports macOS and Linux. Use the official PowerShell repair helper on Windows."; exit 2 ;;
esac
echo "Repair/reinstall step finished. Launch the app and verify its features."
