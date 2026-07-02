export function mapActionFieldErrors(
  fieldErrors?: Record<string, string[]>,
): Record<string, string> {
  if (!fieldErrors) {
    return {};
  }

  const mapped: Record<string, string> = {};

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages[0]) {
      mapped[field] = messages[0];
    }
  }

  return mapped;
}
