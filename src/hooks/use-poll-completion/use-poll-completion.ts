import { useEffect, useRef } from 'react';

export const usePollCompletion = ({
  refetchInterval = 1000,
  onComplete,
  queryCompletion,
  enabled = false,
}: {
  refetchInterval?: number;
  onComplete: (success: boolean) => void;
  queryCompletion: () => Promise<{ complete: boolean; success?: boolean }>;
  enabled: boolean;
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (enabled) {
      const poll = async () => {
        const { complete, success } = await queryCompletion();
        if (complete) {
          onComplete(!!success);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      };

      poll();

      intervalRef.current = setInterval(poll, refetchInterval);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [enabled, onComplete, refetchInterval, queryCompletion]);
};
