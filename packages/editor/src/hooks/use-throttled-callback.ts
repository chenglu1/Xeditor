import { throttle } from 'lodash-es';
import { useMemo } from 'react';

import { useUnmount } from './use-unmount';

interface ThrottleSettings {
  leading?: boolean | undefined;
  trailing?: boolean | undefined;
}

type ThrottledFunction = (...args: never[]) => unknown;
type ThrottledCallback<T extends ThrottledFunction> = {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T>;
  cancel: () => void;
  flush: () => void;
};

const defaultOptions: ThrottleSettings = {
  leading: false,
  trailing: true,
};

/**
 * A hook that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param dependencies The dependencies to watch for changes
 * @param options The throttle options
 */
export function useThrottledCallback<T extends ThrottledFunction>(
  fn: T,
  wait = 250,
  dependencies: React.DependencyList = [],
  options: ThrottleSettings = defaultOptions,
): {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T>;
  cancel: () => void;
  flush: () => void;
} {
  const handler = useMemo(
    () => throttle<T>(fn, wait, options) as ThrottledCallback<T>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...dependencies],
  );

  useUnmount(() => {
    handler.cancel();
  });

  return handler;
}

export default useThrottledCallback;
