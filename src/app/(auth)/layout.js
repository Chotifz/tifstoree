
export const metadata = {
  title: 'Authentication | TIF Store',
  description: 'Masuk atau daftar ke TIF Store',
};

export default function AuthLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body >
          {children}
      </body>
    </html>
  );
}