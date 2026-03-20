#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Building site and exporting PDF..."
npm run export:book

PDF_FILES=(
  "public/recipe-collection.pdf"
  "dist/recipe-collection.pdf"
)

if ! git diff --quiet -- "${PDF_FILES[@]}"; then
  echo "PDF changed. Creating an update commit..."
  git add "${PDF_FILES[@]}"
  git commit -m "[CHORE] pdf: refresh generated book"
else
  echo "Generated PDF is unchanged."
fi

echo "Pushing branch..."
git push "$@"
