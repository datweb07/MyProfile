import Link from 'next/link';

export default function Pagination({page, totalPages, basePath}: {page: number; totalPages: number; basePath: string}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="blog-pagination" aria-label="Pagination">
      <Link className={page <= 1 ? 'is-disabled' : ''} href={`${basePath}?page=${Math.max(1, page - 1)}`} aria-disabled={page <= 1}>
        Previous
      </Link>
      <span>Page {page} of {totalPages}</span>
      <Link className={page >= totalPages ? 'is-disabled' : ''} href={`${basePath}?page=${Math.min(totalPages, page + 1)}`} aria-disabled={page >= totalPages}>
        Next
      </Link>
    </nav>
  );
}
