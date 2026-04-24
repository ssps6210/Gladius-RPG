import type { StoryRewardState } from "../../game/types/tavern";

interface StoryModalProps {
  story: StoryRewardState;
  onDismiss?: () => void;
}

export function StoryModal({ story, onDismiss }: StoryModalProps) {
  return (
    <dialog open>
      <div>QUEST COMPLETE</div>
      <h3>
        {story.icon} {story.title}
      </h3>
      <p>{story.conclusion}</p>
      <p>
        獎勵：{story.reward.gold} 金幣 / {story.reward.exp} 經驗
      </p>
      <button onClick={onDismiss}>收下賞金，離開酒館</button>
    </dialog>
  );
}
