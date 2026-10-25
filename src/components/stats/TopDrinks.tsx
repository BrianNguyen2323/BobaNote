export function TopDrinks({ drinks }: { drinks: { name: string; count: number }[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {drinks.map((drink, index) => (
        <li key={drink.name} className="flex items-center gap-3">
          <span className="w-5 text-sm font-semibold text-ink-muted">{index + 1}</span>
          <span className="min-w-0 flex-1 truncate font-medium">{drink.name}</span>
          <span className="rounded-full bg-accent px-3 py-0.5 text-sm font-semibold text-on-accent">{drink.count}</span>
        </li>
      ))}
    </ol>
  );
}
