interface Drop {
  account: string
  from: number
  to: number
  change: number
}

interface ScoreChangeAlertsProps {
  drops: Drop[]
  gains: Drop[]
}

export function ScoreChangeAlerts({ drops, gains }: ScoreChangeAlertsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-medium text-destructive">Biggest drops</h3>
        {drops.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No recent drops</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {drops.map((d) => (
              <li key={d.account} className="text-sm">
                <span className="font-medium">{d.account}</span>: {d.from} → {d.to}{" "}
                <span className="text-destructive">(▼{Math.abs(d.change)})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-medium text-green-600">Improvements</h3>
        {gains.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No recent gains</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {gains.map((g) => (
              <li key={g.account} className="text-sm">
                <span className="font-medium">{g.account}</span>: {g.from} → {g.to}{" "}
                <span className="text-green-600">(▲{g.change})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
