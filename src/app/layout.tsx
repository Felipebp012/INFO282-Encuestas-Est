import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export const metadata: Metadata = {
  title: "Plataforma de Encuestas",
  description: "Base Sprint 1 — HU-0201/0202/0203/0501/0502/0503",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="mx-auto max-w-3xl px-6 py-10">
          {session?.user && (
            <div className="mb-6 flex items-center justify-between text-sm text-slate-500">
              <Link href="/encuestas" className="hover:underline">
                Mis encuestas
              </Link>
              <div className="flex items-center gap-3">
                <span>{session.user.name}</span>
                <LogoutButton />
              </div>
            </div>
          )}
          {children}
        </div>
      </body>
    </html>
  );
}
