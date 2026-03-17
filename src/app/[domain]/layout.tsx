import { notFound } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
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
      <div className="min-w-0 flex-1 overflow-y-auto px-6 py-6 md:px-10 lg:px-14">
        {children}
      </div>
    </div>
  );
}
