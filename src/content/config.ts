import { defineCollection, z } from 'astro:content';

const recipeSchema = z.object({
  title: z.string(),
  titleEn: z.string().optional(),
  // slug will be auto-generated from filename (Chinese characters preserved)
  category: z.enum([
    '鲁',
    '川',
    '粤闽',
    '淮扬',
    '徽湘',
    '云贵',
    '意法',
    '南洋',
    'Silk-Road',
    'Desserts',
    'Drinks'
  ]),
  prepTime: z.string(),
  cookTime: z.string(),
  bakeTime: z.string().optional(),
  coolTime: z.string().optional(),
  servings: z.number(),
  robot: z.string().optional(),
  coverImage: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
});

const recipes = defineCollection({
  type: 'content',
  schema: z.object({
    ...recipeSchema.shape,
  }),
});

export const collections = {
  recipes,
};
