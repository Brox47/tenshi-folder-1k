interface ProgressGoalProps {
  approved: number;
  goal: number;
  compact?: boolean;
}

export function ProgressGoal({ approved, goal, compact = false }: ProgressGoalProps) {
  const pct = goal > 0 ? Math.min(100, (approved / goal) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-3">
        <p className={compact ? "font-display text-2xl" : "font-display text-4xl sm:text-5xl"}>
          {approved.toLocaleString("fr-FR")}
          <span className="text-muted-foreground"> / {goal.toLocaleString("fr-FR")}</span>
        </p>
        <span className="text-sm font-semibold text-primary">{pct.toFixed(1)}%</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-out"
          style={{ width: `${Math.max(pct, 1.5)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Membres approuvés dans le Folder communautaire
      </p>
    </div>
  );
}
