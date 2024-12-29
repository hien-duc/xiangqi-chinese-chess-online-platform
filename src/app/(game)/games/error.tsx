"use client";

import ErrorDisplay from "@/components/ui/error/ErrorDisplay";

export default function GamesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorDisplay error={error} reset={reset} variant="game" />;
}
