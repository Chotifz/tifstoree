import Header from "@/components/Header";

export const metadata = {
  title: 'Authentication | TIF Store',
  description: 'Masuk atau daftar ke TIF Store',
};

export default function AuthLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body >
        <Header />
          {children}
      </body>
    </html>
  );
}