import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ token?: string; next?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { token, next } = await searchParams;
  const cleanToken = token?.trim();
  const cleanNext = next?.trim();

  if (cleanToken) {
    const nextQuery = cleanNext ? `?next=${encodeURIComponent(cleanNext)}` : "";
    redirect(`/registro/${encodeURIComponent(cleanToken)}${nextQuery}`);
  }

  const nextQuery = cleanNext ? `?next=${encodeURIComponent(cleanNext)}` : "";
  redirect(`/registro${nextQuery}`);
}
