import { notFound } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TableOfContents from "@/components/layout/TableOfContents";
import { getSidebarData } from "@/lib/content";
import { domains } from "@/lib/domains";

export async function generateStaticParams() {
  return domains.map((d) => ({ domain: d.slug }));
}

export default async function DomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const sidebarData = await getSidebarData(domain);
  if (!sidebarData) notFound();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar data={sidebarData} />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-7xl justify-center gap-8 px-6 py-8 lg:px-8">
          {/* Main content area - centered */}
          <div className="min-w-0 flex-1 max-w-3xl">
            {children}
          </div>
          {/* Right sidebar - Table of Contents */}
          <TableOfContents />
        </div>
      </main>
    </div>
  );
}
