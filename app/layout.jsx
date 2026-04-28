import './globals.css';

export const metadata = {
  title: 'Житездатність — симулятор',
  description: '90 днів українського життя з ШІ-подіями',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
