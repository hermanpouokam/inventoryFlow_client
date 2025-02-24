import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <main className="flex justify-center items-center min-h-screen min-w-full">
      {children}
    </main>
  );
}
