#!/usr/bin/env bash
set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a Git repository." >&2
  exit 1
fi

mapfile -t files < <(git diff --name-only --diff-filter=ACMRTUB)

if [ ${#files[@]} -eq 0 ]; then
  echo "No modified files detected."
  exit 0
fi

for file in "${files[@]}"; do
  if [ ! -e "$file" ]; then
    echo "Skipping removed file: $file"
    continue
  fi

  git add -- "$file"

  diff_output="$(git diff --cached -- "$file")"
  if [ -z "$diff_output" ]; then
    echo "No staged diff for $file; skipping."
    git reset -- "$file"
    continue
  fi

  echo "Committing $file ..."
  commit_msg="$(
    DIFF_CONTENT="$diff_output" python - "$file" <<'PY'
import os
import re
import sys
from pathlib import Path

filename = sys.argv[1]
diff = os.environ.get("DIFF_CONTENT", "")
lower = diff.lower()

additions = sum(1 for line in diff.splitlines() if line.startswith('+') and not line.startswith('+++'))
deletions = sum(1 for line in diff.splitlines() if line.startswith('-') and not line.startswith('---'))

desc = []

ext = Path(filename).suffix.lower()
base = Path(filename).name

if ext in {'.tsx', '.jsx', '.ts', '.js'} and ('classname' in lower or 'className' in diff or 'bg-' in lower or 'text-' in lower):
    desc.append("updated UI structure")
if 'useeffect' in lower or 'usestate' in lower or ('const ' in diff and '=>' in diff):
    desc.append("tweaked component logic")
if 'tailwind' in lower or 'gradient' in lower or 'shadow' in lower:
    desc.append("refined styling tokens")
if 'schema' in lower or 'supabase' in lower or 'sql' in lower:
    desc.append("modified data integration")
if 'describe(' in diff or 'test(' in diff or 'expect(' in diff:
    desc.append("adjusted tests")
if 'config' in filename.lower():
    desc.append("updated configuration")
if '+import' in diff or '-import' in diff:
    desc.append("changed imports")

if not desc:
    if additions and deletions:
        desc.append("refined implementation")
    elif additions:
        desc.append("added new code")
    elif deletions:
        desc.append("removed unused code")
    else:
        desc.append("minor adjustments")

summary = ", ".join(dict.fromkeys(desc))
message = f"Updated {base}: {summary}."
print(message[:200])
PY
  )"

  git commit -m "$commit_msg"
done

echo "All files committed."
