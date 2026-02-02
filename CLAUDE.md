# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A bilingual (Chinese/English) personal recipe website built with Astro 5.0, Tailwind CSS, and MDX content collections. Deployed to GitHub Pages via GitHub Actions.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start local development server
npm run build        # Build static site for production
npm run preview      # Preview production build locally

# Utility scripts
node scripts/new-recipe.js <category> <title>   # Create new recipe file
node scripts/compress.js 80 1920                # Compress images (quality, maxWidth)
```

## Architecture

### Content Collections
Recipes are stored as MDX files in `src/content/recipes/{category}/` using Astro's Content Collections API with Zod schema validation.

### Categories
- 鲁 (Shandong), 川 (Sichuan), 粤闽 (Cantonese/Fujian), 淮扬 (Huaiyang)
- 徽湘 (Anhui/Hunan), 云贵 (Yunnan/Guizhou), 意法 (Italian/French)
- 南洋 (Southeast Asian), Silk-Road, Desserts, Drinks

### Pages & Routing
- `/` - Homepage with category grid
- `/Recipe/{category}` - Category listing (dynamic route)
- `/Recipe/{category}/{slug}` - Individual recipe detail (dynamic route)
- `/Recipe/book` - Export all recipes as a single PDF book

### Components
- `BaseLayout.astro` - Main HTML wrapper with Navigation and Footer
- `RecipeLayout.astro` - Recipe page wrapper
- `RecipeCard.astro` - Reusable card for recipe listings
- `RecipeMeta.astro` - Displays prep/cook times, servings with icons

## Recipe Frontmatter Schema

```yaml
---
title: 菜谱名称
titleEn: English Name (optional)
category: 菜系分类
prepTime: "准备时间"
cookTime: "烹饪时间"
bakeTime: "烘烤时间" (optional)
coolTime: "冷却时间" (optional)
servings: 人数
coverImage: "/images/recipes/图片文件名.jpg"
difficulty: easy/medium/hard (optional)
tags: ["tag1", "tag2"] (optional)
robot: "机器人名称" (optional, for recipes using robot assistance)
---

## 食材
| 用量 | 食材 |

## 步骤
1. 步骤1

## 小贴士
- 提示
```

**Note**: The URL slug is derived from the MDX filename (Chinese characters preserved). Place recipe files in `src/content/recipes/{category}/{中文名}.mdx`.

## PDF Export

The website supports one-click PDF export via browser print dialog (`window.print()`). The print layout features:

- **Two-column layout**: Ingredients on left, steps on right (matching LaTeX cuisine.sty style)
- **LaTeX-inspired typography**: Terracotta red headings (#a41034), Merriweather serif font
- **Decorative tip section**: Left border with accent dot styling
- **Clean print output**: No navigation, buttons, or hero images in print

To export: Click "导出 PDF" button on any recipe page, then choose "Save as PDF" in print dialog.

## Tailwind Theme

Custom palette: `terracotta` (primary accent), `cream` (background), `sage` (green accent). Fonts: Noto Sans SC (Chinese), Merriweather (serif).

## GitHub Actions

- `deploy.yml` - Builds and deploys to GitHub Pages on push to main
- `compress-images.yml` - Auto-compresses images to WebP when recipes folder changes
