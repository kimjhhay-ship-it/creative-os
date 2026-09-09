import "./globals.css";

export const metadata = {
  title: "Creative OS",
  description: "AI-assisted advertising creative planning"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
