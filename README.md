# 菜谱网站 | Recipe Website

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

4. 运行图片压缩脚本：
```bash
node scripts/compress.js 80 1920
```

5. 提交并推送到 GitHub，网站会自动部署

## 导出 PDF

在任意菜谱页面，点击 **"导出 PDF"** 按钮，会打开浏览器打印对话框：

- 选择 "保存为 PDF"
- 每道菜谱会单独占一页
- 打印样式已优化，适合装订成册

## 开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建
npm run build
```

## 部署

推送到 `main` 分支后，GitHub Actions 会自动部署到 GitHub Pages。

网站地址：`https://你的用户名.github.io/仓库名/`
