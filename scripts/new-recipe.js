#!/usr/bin/env node

/**
 * 快速创建新菜谱文件
 * 用法: node scripts/new-recipe.js 川 麻婆豆腐
 */

const fs = require('fs/promises');
const path = require('path');

const template = `---
title: {TITLE}
titleEn: {TITLE_EN}
category: {CATEGORY}
prepTime: "20 min"
cookTime: "30 min"
servings: 4
coverImage: "/images/recipes/{FILENAME}.jpg"
---

## 食材

| 用量 | 食材 |
|------|------|
| 500g | 食材1 |
| 200g | 食材2 |

## 步骤

1. 步骤1
2. 步骤2

## 小贴士

- 提示1
- 提示2
`;

async function createRecipe(category, title) {
  const filename = title;
  const content = template
    .replace('{TITLE}', title)
    .replace('{TITLE_EN}', title)
    .replace('{CATEGORY}', category)
    .replace('{FILENAME}', filename);

  const dir = path.join('./src/content/recipes', category);
  const filePath = path.join(dir, `${filename}.mdx`);

  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  await fs.writeFile(filePath, content);
  console.log(`✓ Created: ${filePath}`);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node scripts/new-recipe.js <category> <title>');
  console.log('Example: node scripts/new-recipe.js 川 麻婆豆腐');
  process.exit(1);
}

createRecipe(args[0], args[1]);
