import { type IDisposable, type DisposableStore } from "@wopjs/disposable";

export interface Event<T> {
  (
    listener: (data: T) => void,
    thisArgs?: any,
    disposableStore?: DisposableStore
  ): IDisposable;
}

export function toPromise<T>(event: Event<T>): Promise<T>;
export function toPromise<T>(event: Event<T>, signal: AbortSignal): Promise<T | undefined>;
export function toPromise<T>(event: Event<T>, signal?: AbortSignal): Promise<T | undefined> {
  if (!signal) {
    return new Promise<T>((resolve) => once(event, resolve));
  }

  if (signal.aborted) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve) => {
    const d2 = once(event, (data) => {
      signal.removeEventListener('abort', d1);
      resolve(data);
    });

    const d1 = () => {
      d2.dispose();
      signal.removeEventListener('abort', d1);
      resolve(undefined);
    };

    signal.addEventListener('abort', d1);
  });
}

export const once = <T>(
  event: Event<T>,
  listener: (data: T) => void
): IDisposable => {
  const d = event((data) => {
    listener(data);
    d.dispose();
  });

  return d;
};

export class EventEmitter<T> implements IDisposable {
  private listeners?: Array<(data: T) => void>;

  public readonly event: Event<T> = (listener, thisArgs, disposableStore) => {
    const disposable = this.add(thisArgs ? listener.bind(thisArgs) : listener);
    disposableStore?.add(disposable);

    return disposable;
  };

  public get size() {
    if (!this.listeners) {
      return 0;
    }

    return this.listeners.length;
  }

  public fire(data: T) {
    this.listeners?.forEach((listener) => {
      listener(data);
    });
  }

  private add(listener: (data: T) => void): IDisposable {
    if (!this.listeners) {
      this.listeners = [listener];
    } else {
      this.listeners.push(listener);
    }

    return {
      dispose: () => this.rm(listener),
    };
  }

  private rm(listener: (data: T) => void) {
    if (!this.listeners) {
      return;
    }

    const index = this.listeners.indexOf(listener);
    if (index === -1) {
      return;
    }

    this.listeners = this.listeners
      .slice(0, index)
      .concat(this.listeners.slice(index + 1));
  }

  public dispose() {
    this.listeners = undefined;
  }
}
