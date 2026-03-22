declare module 'lodash-es' {
  export function throttle<T extends (...args: never[]) => unknown>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean;
      trailing?: boolean;
    },
  ): T & {
    cancel: () => void;
    flush: () => void;
  };
}
