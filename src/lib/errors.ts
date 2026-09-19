export function friendlyError(input: unknown): string {
  const raw =
    input instanceof Error
      ? input.message
      : typeof input === "string"
        ? input
        : "";
  const lower = raw.toLowerCase();

  if (
    !raw ||
    lower.includes("at least one") ||
    lower.includes("empty") ||
    lower.includes("paste")
  ) {
    return "Please add at least one transaction.";
  }

  if (
    lower.includes("enough") ||
    lower.includes("pattern") ||
    lower.includes("merchant") ||
    lower.includes("valid transaction") ||
    lower.includes("unreadable")
  ) {
    return "We couldn't find enough information to identify meaningful patterns.";
  }

  return "We couldn't analyze this data. Try again.";
}
