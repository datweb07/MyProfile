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
  views_count: number;
  likes_count: number;
}

export type PostCard = Pick<
  Post,
  'id' | 'title' | 'slug' | 'description' | 'thumbnail' | 'draft' | 'published_at' | 'views_count' | 'likes_count'
>;

export type CreatePostInput = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'views_count' | 'likes_count'>;
export type UpdatePostInput = Partial<CreatePostInput> & {id: string};

export type PostActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export interface BlogComment {
  id: string;
  post_id: string;
  name: string;
  content: string;
  likes_count: number;
  created_at: string;
}
