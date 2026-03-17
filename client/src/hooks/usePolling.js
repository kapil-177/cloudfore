import { useEffect, useRef } from "react";

export default function usePolling(task, delay) {
  const taskRef = useRef(task);

  useEffect(() => {
    taskRef.current = task;
  }, [task]);

  useEffect(() => {
    let intervalId = null;
    let timeoutId = null;

    const runTask = async () => {
      if (document.hidden) {
        return;
      }

      await taskRef.current();
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        runTask();
      }
    };

    timeoutId = window.setTimeout(runTask, 0);
    intervalId = window.setInterval(runTask, delay);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [delay]);
}
