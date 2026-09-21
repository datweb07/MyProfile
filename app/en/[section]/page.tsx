import {notFound} from 'next/navigation';
import LocalePortfolioPage from '@/components/LocalePortfolioPage';

const sections = ['home', 'journey', 'writing'] as const;

export const revalidate = 60;

export function generateStaticParams() {
  return sections.map((section) => ({section}));
}

export default async function EnglishSectionPage({params}: {params: Promise<{section: string}>}) {
  const {section} = await params;
  if (!sections.includes(section as (typeof sections)[number])) notFound();
  return <LocalePortfolioPage locale="en" />;
}
