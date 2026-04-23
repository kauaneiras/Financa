import './globals.css';
import { ThemeProvider } from './components/ThemeProvider';
import ClientLayout from './components/ClientLayout';

export const metadata = {
  title: 'Financa',
  description: 'Seu ecossistema financeiro pessoal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
