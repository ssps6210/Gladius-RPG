interface MercenaryRunSummaryProps {
  result: { survivors: number; summary: string[] };
}

export function MercenaryRunSummary({ result }: MercenaryRunSummaryProps) {
  return (
    <section>
      <h3>倖存傭兵：{result.survivors}</h3>
      {result.summary.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </section>
  );
}
