import type { RatedDrink } from "../../lib/stats";

const rankClass = "w-5 text-sm font-semibold text-ink-muted";
const badgeClass = "shrink-0 rounded-full bg-accent px-3 py-0.5 text-sm font-semibold text-on-accent";

export function TopDrinks({ drinks }: { drinks: { name: string; count: number }[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {drinks.map((drink, index) => (
        <li key={drink.name} className="flex items-center gap-3">
          <span className={rankClass}>{index + 1}</span>
          <span className="min-w-0 flex-1 truncate font-medium">{drink.name}</span>
          <span className={badgeClass}>{drink.count}</span>
        </li>
      ))}
    </ol>
  );
}

const times = (n: number) => `${n} ${n === 1 ? "time" : "times"}`;

export function TopRatedDrinks({ drinks }: { drinks: RatedDrink[] }) {
  if (drinks.length === 0) {
    return <p className="text-ink-muted">Rate a drink in this period to see your favorites here.</p>;
  }
  return (
    <ol className="flex flex-col gap-3">
      {drinks.map((drink, index) => {
        const average = Number(drink.averageRating.toFixed(1));
        return (
          <li key={drink.name} className="flex items-center gap-3">
            <span className={rankClass}>{index + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{drink.name}</span>
              <span className="block text-sm text-ink-muted">
                Ordered {times(drink.count)}
                {drink.count > drink.ratedCount && `, rated ${drink.ratedCount}`}
              </span>
            </span>
            <span className={badgeClass} aria-label={`Average rating ${average} out of 10`}>
              {average}/10
            </span>
          </li>
        );
      })}
    </ol>
  );
}
