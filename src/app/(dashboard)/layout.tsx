import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary/20 selection:text-secondary">
      <Header />
      <main className="flex-1 py-10">
        <Container>{children}</Container>
      </main>
      <Footer />
    </div>
  );
}
