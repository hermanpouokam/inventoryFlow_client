import { useState, useEffect } from "react";

type UseTimerProps = {
  initialTime: number; // Initial time in seconds
  onTimerEnd: () => void; // Callback function when the timer ends
};

type UseTimerReturn = {
  timeLeft: number; // Remaining time in seconds
  isActive: boolean; // Whether the timer is running
  resetTimer: () => void; // Function to reset the timer
  stopTimer: () => void; // Function to stop the timer manually
};

const useTimer = ({
  initialTime,
  onTimerEnd,
}: UseTimerProps): UseTimerReturn => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval as NodeJS.Timeout);
      setIsActive(false);
      onTimerEnd(); // Trigger the callback when the timer ends
    }

    // Cleanup the interval on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onTimerEnd]);

  const resetTimer = () => {
    setTimeLeft(initialTime);
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false); // Stop the timer
  };

  return { timeLeft, isActive, resetTimer, stopTimer };
};

export default useTimer;
