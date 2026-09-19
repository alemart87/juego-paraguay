import { createFileRoute } from "@tanstack/react-router";
import { BattleGame } from "@/battle/BattleGame";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <BattleGame />;
}
