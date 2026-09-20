'use client';

import type {ReactNode} from 'react';
import {NextIntlClientProvider} from 'next-intl';

type Messages = Record<string, unknown>;

export default function LocaleIntlProvider({
  children,
  locale,
  messages
}: {
  children: ReactNode;
  locale: string;
  messages: Messages;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
