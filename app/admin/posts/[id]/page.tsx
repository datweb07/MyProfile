import {notFound} from 'next/navigation';
import PostEditorForm from '@/components/admin/PostEditorForm';
import {getAdminPostById} from '@/lib/posts';

export default async function EditPostPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const post = await getAdminPostById(id);
  if (!post) notFound();
  return <PostEditorForm post={post} />;
}
