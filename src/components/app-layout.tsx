import { useEffect, type ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { seedIfEmpty } from "@/lib/store";

export function AppLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-svh overflow-hidden">
          <header className="h-14 shrink-0 flex items-center gap-3 border-b bg-card/60 backdrop-blur px-4 z-10">
            <SidebarTrigger />
            <h1 className="text-base font-semibold text-foreground">{title}</h1>
          </header>
          <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}