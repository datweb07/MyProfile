import LocalePortfolioPage from '@/components/LocalePortfolioPage';

export const revalidate = 60;

export default function EnglishPage() {
  return <LocalePortfolioPage locale="en" />;
}
