import {z} from 'zod';

export const CreatePostSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain lowercase letters, numbers and hyphens only'),
  content: z.string().trim().min(1, 'Content is required'),
  description: z.string().trim().default(''),
  thumbnail: z.union([z.literal(''), z.url('Thumbnail must be a valid URL')]).default(''),
  draft: z.boolean().default(false),
  published_at: z.iso.datetime().default(() => new Date().toISOString())
});

export const UpdatePostSchema = CreatePostSchema.extend({
  id: z.uuid('Invalid post id')
});

export const LoginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must contain at least 6 characters')
});
