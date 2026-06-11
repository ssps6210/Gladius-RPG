import { useLanguage } from "../../game/i18n/LanguageContext";

interface MercenaryRunSummaryProps {
  result: { survivors: number; summary: string[] };
}

export function MercenaryRunSummary({ result }: MercenaryRunSummaryProps) {
  const { L } = useLanguage();
  return (
    <section>
      <h3>{L("倖存傭兵", "Surviving Mercs", "幸存佣兵")}：{result.survivors}</h3>
      {result.summary.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </section>
  );
}
