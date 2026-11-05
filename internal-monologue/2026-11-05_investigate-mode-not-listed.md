# Investigate custom mode missing from mode list

- Request: new mode assigned to this project doesn't show in the mode list.
- Checked `.bob/custom_modes.yaml`: valid YAML, one mode (`product-manager`), unique slug, supported groups. Global `~/.bob/settings/custom_modes.yaml` is empty.
- `.gitignore` ignores `.bob/`; this affects git only, not mode loading.
- Per Bob docs, project modes are unavailable when the workspace is untrusted (safe mode). Most likely cause; can't verify from files.
- No files changed. Noted that `.bob/rules/basic_rules.md` was externally replaced with an indented copy of old AGENTS.md content.
