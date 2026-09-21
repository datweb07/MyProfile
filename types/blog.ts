export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  thumbnail: string;
  draft: boolean;
  created_at: string;
  updated_at: string;
  published_at: string;
}

export type PostCard = Pick<
  Post,
  'id' | 'title' | 'slug' | 'description' | 'thumbnail' | 'draft' | 'published_at'
>;

export type CreatePostInput = Omit<Post, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePostInput = Partial<CreatePostInput> & {id: string};

export type PostActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
