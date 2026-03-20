export interface RecipeTableRow {
  amount: string;
  ingredient: string;
}

export interface RecipeIngredientGroup {
  title?: string;
  titleEn?: string;
  rows: RecipeTableRow[];
}

export interface RecipeExtraSection {
  title: string;
  items: string[];
}

export interface ParsedRecipeBody {
  ingredientGroups: RecipeIngredientGroup[];
  ingredientRows: RecipeTableRow[];
  stepItems: string[];
  tipItems: string[];
  extras: RecipeExtraSection[];
}

interface RawSection {
  heading: string;
  content: string;
}

function splitSections(body: string): RawSection[] {
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

function parseTableRows(sectionBody: string): RecipeTableRow[] {
  return sectionBody
    .split('\n')
    .filter((line) => line.includes('|'))
    .filter((line) => !line.match(/^\s*\|[\s\-:|]+\|$/))
    .map((line) => line.split('|').map((cell) => cell.trim()).filter(Boolean))
    .filter((cells) => cells.length >= 2)
    .filter((cells) => cells[0] !== '用量' && cells[1] !== '食材')
    .map((cells) => ({ amount: cells[0], ingredient: cells[1] }));
}

function parseIngredientGroups(sectionBody: string): RecipeIngredientGroup[] {
  const subgroupMatches = [...sectionBody.matchAll(/^###\s+(.+)$/gm)];

  if (!subgroupMatches.length) {
    const rows = parseTableRows(sectionBody);
    return rows.length ? [{ rows }] : [];
  }

  return subgroupMatches
    .map((match, index) => {
      const fullHeading = match[1].trim();
      const start = match.index! + match[0].length;
      const end = index + 1 < subgroupMatches.length ? subgroupMatches[index + 1].index! : sectionBody.length;
      const content = sectionBody.slice(start, end).trim();
      const rows = parseTableRows(content);
      const [title, titleEn] = fullHeading.split('|').map((part) => part?.trim()).filter(Boolean);

      return {
        title,
        titleEn,
        rows,
      };
    })
    .filter((group) => group.rows.length > 0);
}

function parseListItems(sectionBody: string): string[] {
  return sectionBody
    .split(/\n(?:\d+\.\s+|-\s+)/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseRecipeBody(body: string): ParsedRecipeBody {
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

  const ingredientGroups = ingredients ? parseIngredientGroups(ingredients.content) : [];
  const ingredientRows = ingredientGroups.flatMap((group) => group.rows);

  return {
    ingredientGroups,
    ingredientRows,
    stepItems: steps ? parseListItems(steps.content) : [],
    tipItems: tips ? parseListItems(tips.content) : [],
    extras: extras.map((section) => ({
      title: section.heading.split('|')[0].trim(),
      items: parseListItems(section.content),
    })),
  };
}
