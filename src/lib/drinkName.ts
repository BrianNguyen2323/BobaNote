export function normalizeDrinkName(name: string): string {
  return name.trim().split(/\s+/).join(" ").toLowerCase();
}
