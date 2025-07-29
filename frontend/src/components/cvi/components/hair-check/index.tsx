import { memo, useEffect } from "react";
import { useDaily } from "@daily-co/daily-react";
import { MicSelectBtn } from "../device-select";
import { useStartHaircheck } from "../../hooks/use-start-haircheck";
import styles from "./hair-check.module.css";

const JoinBtn = ({
  disabled,
  onClick
}: {
  disabled: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      className={styles.joinBtn}
      onClick={onClick}
      disabled={disabled}
    >
      Join call
    </button>
  );
};

interface HairCheckProps {
  onComplete: () => void;
}

// Simplified voice-only hair check - no camera needed for Rosa
export const HairCheck = memo<HairCheckProps>(({ onComplete }) => {
  const daily = useDaily();
  const { isPermissionsGranted, requestPermissions } = useStartHaircheck();

  // Auto-complete hair check for voice-only Rosa
  useEffect(() => {
    if (daily && isPermissionsGranted) {
      // For voice-only, we can auto-complete once microphone is ready
      onComplete();
    }
  }, [daily, isPermissionsGranted, onComplete]);

  const handleJoin = () => {
    requestPermissions();
    onComplete();
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.title}>
          🎤 Voice Check
        </div>
        
        <div className={styles.description}>
          Rosa is voice-only. Make sure your microphone is working.
        </div>

        <div className={styles.controls}>
          <MicSelectBtn />
        </div>

        <div className={styles.actions}>
          <JoinBtn
            disabled={!isPermissionsGranted}
            onClick={handleJoin}
          />
        </div>
      </div>
    </div>
  );
});
