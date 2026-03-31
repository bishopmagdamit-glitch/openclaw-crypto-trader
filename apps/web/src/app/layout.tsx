import './globals.css';

export const metadata = {
  title: 'OpenClaw Trading Sim',
  description: 'BNB terminal style trading sim UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
