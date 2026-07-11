import { Wizard } from "@/components/wizard/wizard";

export const metadata = { title: "Yeni Proje" };

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return <Wizard initialType={type} />;
}
