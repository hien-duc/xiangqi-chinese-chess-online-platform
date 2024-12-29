"use client";

import ErrorDisplay from "@/components/ui/error/ErrorDisplay";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorDisplay error={error} reset={reset} variant="auth" />;
}
