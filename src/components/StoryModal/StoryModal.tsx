import { useLanguage } from "../../game/i18n/LanguageContext";
import type { StoryRewardState } from "../../game/types/tavern";

interface StoryModalProps {
  story: StoryRewardState;
  onDismiss?: () => void;
}

export function StoryModal({ story, onDismiss }: StoryModalProps) {
  const { t, L } = useLanguage();
  return (
    <dialog open>
      <div>{L("任務完成", "QUEST COMPLETE")}</div>
      <h3>
        {story.icon} {story.title}
      </h3>
      <p>{story.conclusion}</p>
      <p>
        {L(`獎勵：${story.reward.gold} 金幣 / ${story.reward.exp} 經驗`, `Reward: ${story.reward.gold} gold / ${story.reward.exp} EXP`)}
      </p>
      <button onClick={onDismiss}>{t("tavernLeave")}</button>
    </dialog>
  );
}
