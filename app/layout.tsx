import { GravityStarsBackground } from "@/components/animate-ui/components/backgrounds/gravity-stars";
import "./globals.css";

export const metadata = {
  title: "GY Coding AI Hub",
  description: "Personal AI assistants for coding and more.",
   icons: {
    icon: '/gy-logo.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-black text-zinc-200 min-h-screen antialiased font-sans relative overflow-x-hidden">
        <GravityStarsBackground className="fixed inset-0 -z-10 w-full h-full" />
        {children}
      </body>
    </html>
  );
}
