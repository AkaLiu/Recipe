# Piglet's Gourmet Odyssey

个人菜谱收藏网站，使用 Astro + Tailwind CSS 构建，部署在 GitHub Pages。

## 菜系分类

- **鲁** - 山东菜
- **川** - 川菜（四川/重庆）
- **粤闽** - 粤菜/闽菜
- **淮扬** - 淮扬菜
- **徽湘** - 徽菜/湘菜
- **云贵** - 云南/贵州菜
- **意法** - 意大利/法国菜
- **南洋** - 东南亚菜
- **Silk-Road** - 丝路风味
- **Latin-America** - 拉美
- **Japan-Korea** - 日韩
- **Fast-Food** - 快餐
- **Desserts** - 甜点
- **Drinks** - 饮品

## 添加新菜谱

1. 在 `src/content/recipes/对应的菜系目录` 下创建新的 `.mdx` 文件

2. 使用以下格式：

```markdown
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
---

## 食材

| 用量 | 食材 |
|------|------|
| 500g | 食材1 |

## 步骤

1. 步骤1
2. 步骤2

## 小贴士

- 提示1
- 提示2
```

3. 将图片放入 `public/images/recipes/` 目录

4. 构建前会自动检查 Markdown frontmatter 里的本地 `coverImage`
   - 仅处理本地 `/images/...` 路径
   - 原图大于 `1MB` 时，会自动生成同分辨率的 `*.optimized.webp`
   - 网站构建时会优先使用优化版图片，不需要手动改 Markdown 路径

5. 提交并推送到 GitHub，网站会自动部署

## 导出 PDF

本地导出：

```bash
npm run pdf:book
```

这会生成：

- `public/recipe-collection.pdf`
- `dist/recipe-collection.pdf`

完整导出站点并同步更新 PDF：

```bash
npm run export:book
```

GitHub Actions 里也提供了手动的 `Export PDF Book` workflow，可按需生成并下载 PDF artifact。

## 开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建
npm run build

# 构建并导出 PDF
npm run export:book
```

## 部署

推送到 `master` 分支后，GitHub Actions 会自动部署到 GitHub Pages。

当前仓库额外约定：

- 在本仓库目录下执行 `git push ...` 时，会先自动运行 `npm run export:book`，更新最新 PDF 后再继续 push
- 如果只是想手动触发这套流程，也可以执行 `npm run push:pdf -- origin master`
- 这个行为只对当前仓库路径生效，不影响其他项目

建议：

- 准备提交前先确认 `public/recipe-collection.pdf` 已经更新
- 如果改动了排版或图片，优先使用 `npm run export:book`

网站地址：`https://你的用户名.github.io/仓库名/`
