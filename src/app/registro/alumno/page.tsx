import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { token } = await searchParams;
  const query = token?.trim() ? `?token=${encodeURIComponent(token.trim())}` : "";

  redirect(`/registro${query}`);
}
