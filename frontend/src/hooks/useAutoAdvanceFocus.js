// utils/hooks/useAutoAdvanceFocus.js
import { useRef, useEffect, useCallback } from "react";

const useAutoAdvanceFocus = (refs, transitions) => {
  const inactivityTimers = useRef({});

  const triggerAction = useCallback(
    (targetName, action, delay) => {
      const targetRef = refs[targetName]?.current;
      if (!targetRef) {
        console.warn(
          `useAutoAdvanceFocus: Ref not found for target "${targetName}"`
        );
        return null;
      }

      const timerId = setTimeout(() => {
        if (action === "focus" && typeof targetRef.focus === "function") {
          targetRef.focus();
        } else if (
          action === "openDropdown" &&
          typeof targetRef.openDropdown === "function"
        ) {
          targetRef.openDropdown();
        } else {
          console.warn(
            `useAutoAdvanceFocus: Action "${action}" not supported or ref "${targetName}" doesn't support it.`
          );
        }
      }, delay);
      return timerId;
    },
    [refs]
  );

  const handleAutoAdvance = useCallback(
    (fieldName, value) => {
      if (inactivityTimers.current[fieldName]) {
        clearTimeout(inactivityTimers.current[fieldName]);
        delete inactivityTimers.current[fieldName];
      }

      if (!value) {
        return;
      }

      const transition = transitions[fieldName];
      if (transition) {
        const { target, action, delay, type } = transition;

        if (type === "inactivity") {
          inactivityTimers.current[fieldName] = triggerAction(
            target,
            action,
            delay
          );
        } else {
          triggerAction(target, action, delay);
        }
      }
    },
    [transitions, triggerAction]
  );

  useEffect(() => {
    const timers = inactivityTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);
  return { handleAutoAdvance };
};

export default useAutoAdvanceFocus;
