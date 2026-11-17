
#!/bin/bash
set -e

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

VAULT="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Zweites Gehirn"
PROJECT="$HOME/Documents/efsonots"

# Check that the Obsidian vault exists
if [ ! -d "$VAULT" ]; then
  echo "ERROR: Obsidian vault not found."
  exit 1
fi

# Copy the entire vault into Quartz
rsync -av --delete \
  --exclude=".obsidian/" \
  --exclude=".git/" \
  --exclude=".DS_Store" \
  "$VAULT/" \
  "$PROJECT/content/"

cd "$PROJECT"

# Show changes before publishing
echo ""
echo "Files changed:"
git status --short -- content/

echo ""
read -r -p "Publish these changes to GitHub? [y/N] " answer

if [[ "$answer" != "y" && "$answer" != "Y" ]]; then
  echo "Publishing cancelled."
  exit 0
fi

# Publish to GitHub
npx quartz sync

echo "EfsoNots successfully published!"

