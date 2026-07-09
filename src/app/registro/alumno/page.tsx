import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ token?: string; next?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { token, next } = await searchParams;
  const params = new URLSearchParams();

  if (token?.trim()) {
    params.set("token", token.trim());
  }

  if (next?.trim()) {
    params.set("next", next.trim());
  }

  const query = params.size > 0 ? `?${params.toString()}` : "";

  redirect(`/registro${query}`);
}
