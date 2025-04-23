export const metadata = {
  title: "Langchain Chat App",
  description: "Next.js chat with Langchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
