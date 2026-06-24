import { AppShell } from "@/components/layout/AppShell";
import { HomeContent } from "@/components/home/HomeContent";
import { fetchTrendingTokens } from "@/lib/codex";

export const revalidate = 30;

export default async function HomePage() {
  const tokens = await fetchTrendingTokens(20);

  return (
    <AppShell tokens={tokens}>
      <HomeContent tokens={tokens} />
    </AppShell>
  );
}
