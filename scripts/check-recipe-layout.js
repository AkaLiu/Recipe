#!/usr/bin/env node

const fs = require('fs/promises');
const path = require('path');

function splitSections(body) {
  return body
    .split(/^##\s+/m)
    .filter(Boolean)
    .map((part) => {
      const [headingLine, ...rest] = part.split('\n');
      return {
        heading: headingLine.trim(),
        content: rest.join('\n').trim(),
      };
    });
}

function parseTableRows(sectionBody) {
  return sectionBody
    .split('\n')
    .filter((line) => line.includes('|'))
    .filter((line) => !line.match(/^\s*\|[\s\-:|]+\|$/))
    .map((line) => line.split('|').map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.length >= 2)
    .filter((cells) => cells[0] !== '用量' && cells[1] !== '食材');
}

function parseListItems(sectionBody) {
  return sectionBody
    .split(/\n(?:\d+\.\s+|-\s+)/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRecipeBody(body) {
  const sections = splitSections(body);
  const ingredients = sections.find((section) => section.heading.includes('食材'));
  const steps = sections.find((section) => section.heading.includes('步骤'));
  const tips = sections.find((section) => section.heading.includes('小贴士'));
  const extras = sections.filter(
    (section) =>
      !section.heading.includes('食材') &&
      !section.heading.includes('步骤') &&
      !section.heading.includes('小贴士')
  );

  return {
    ingredientRows: ingredients ? parseTableRows(ingredients.content) : [],
    stepItems: steps ? parseListItems(steps.content) : [],
    tipItems: tips ? parseListItems(tips.content) : [],
    extras: extras.map((section) => ({
      title: section.heading,
      items: parseListItems(section.content),
    })),
  };
}

function evaluateLayoutRisk(parsed) {
  const ingredientCount = parsed.ingredientRows.length;
  const stepCount = parsed.stepItems.length;
  const tipCount = parsed.tipItems.length;
  const extraCount = parsed.extras.reduce((sum, section) => sum + section.items.length, 0);
  const stepChars = parsed.stepItems.reduce((sum, item) => sum + item.length, 0);
  const tipChars = parsed.tipItems.reduce((sum, item) => sum + item.length, 0);
  const extraChars = parsed.extras.reduce(
    (sum, section) => sum + section.items.reduce((inner, item) => inner + item.length, 0),
    0
  );

  const score =
    ingredientCount * 1.2 +
    stepCount * 2.6 +
    tipCount * 1.8 +
    extraCount * 1.8 +
    stepChars / 55 +
    tipChars / 70 +
    extraChars / 70;

  const warnings = [];

  if (ingredientCount > 12) warnings.push(`ingredients=${ingredientCount} exceeds recommended max 12`);
  if (stepCount > 8) warnings.push(`steps=${stepCount} exceeds recommended max 8`);
  if (tipCount > 3) warnings.push(`tips=${tipCount} exceeds recommended max 3`);
  if (extraCount > 2) warnings.push(`extra_items=${extraCount} may force notes overflow`);
  if (stepChars > 420) warnings.push(`step_text=${stepChars} chars is likely too verbose for one page`);
  if (score > 42) warnings.push(`layout_score=${score.toFixed(1)} is above single-page budget 42`);

  return {
    score,
    warnings,
    stats: { ingredientCount, stepCount, tipCount, extraCount, stepChars, tipChars, extraChars },
  };
}

async function checkFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const content = await fs.readFile(absolutePath, 'utf8');
  const body = content.replace(/^---[\s\S]*?---\s*/, '');
  const parsed = parseRecipeBody(body);
  const result = evaluateLayoutRisk(parsed);

  console.log(`Layout check: ${filePath}`);
  console.log(
    `  ingredients=${result.stats.ingredientCount}, steps=${result.stats.stepCount}, tips=${result.stats.tipCount}, extra_items=${result.stats.extraCount}, score=${result.score.toFixed(1)}`
  );

  if (result.warnings.length > 0) {
    console.warn('WARNING: recipe may not fit a single PDF page cleanly.');
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    process.exitCode = 2;
  } else {
    console.log('OK: recipe is within the current single-page budget.');
  }
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node scripts/check-recipe-layout.js <recipe-file.mdx>');
  process.exit(1);
}

checkFile(args[0]).catch((error) => {
  console.error(error);
  process.exit(1);
});
