import './globals.css';

export const metadata = {
  title: 'FinHub',
  description: 'Seu Ecossistema Financeiro Universal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased font-sans flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  );
}
