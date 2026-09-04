import "./globals.css";

export const metadata = {
  title: "Student Task Manager",
  description: "A calmer way to organize your semester.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
