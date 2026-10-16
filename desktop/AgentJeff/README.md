# Agent Jeff for Windows — native voice application

This is a Windows desktop application project, not website UI. It uses the installed Windows speech recognizer and speech synthesizer for real dictation and voice output.

## Build locally
1. Install the .NET 8 SDK on Windows.
2. Open PowerShell in this directory.
3. Run `dotnet restore`
4. Run `dotnet run`

To publish a self-contained Windows x64 folder:
`dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true`

## Current real capabilities
- Select from voices installed in Windows and preview them.
- Start/stop microphone capture explicitly.
- Convert recognized speech into editable text using an installed Windows speech recognizer.
- Speak reviewed text with Windows text-to-speech.
- Stop speech and clear the transcript.
- Open a stoppable, always-on-top desktop companion panel after Windows sign-in.

## Not implemented (do not treat as secure)
Speaker verification / voice enrollment is not implemented. Speech-to-text does not establish speaker identity. A real "only respond to my voice" feature still requires integrating and testing a speaker-verification model, protected template storage, replay-attack evaluation and a secure fallback. Do not use voice matching alone to authorize sensitive actions. No voice samples are saved by this application.

The desktop companion is an ordinary topmost window shown after sign-in. Windows does not allow this app to overlay or replace the secure Windows lock/sign-in screen. The companion has Stop & Hide controls and remains visible in the taskbar.

The app does not yet connect spoken requests to a configured Jeff AI backend. It is the native voice subsystem, not the complete Agent Jeff autonomous agent. Windows language/recognizer availability varies by device.
