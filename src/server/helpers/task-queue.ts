export type TaskCallback<T> = (context: TaskContext) => Promise<T>;

export interface TaskStatus<T> {
  id: string;
  status: 'START' | 'COMPLETE';
  time: number;
  markers: TaskMark[];
  result: T | undefined;
}

export interface QueueStatus<T> {
  status: 'START' | 'COMPLETE';
  time: number;
  markers: TaskMark[];
  results: (T | undefined)[];
}

export interface TaskMark {
  name: string;
  duration: number;
  timestamp: number;
}

export interface TaskLog {
  name: string;
  payload: string;
}

export interface TaskContext {
  marker: (mark: string) => void;
}

interface Task<T> {
  callback?: TaskCallback<T>;
  id: string;
}

export class TaskQueue<T> {

  private readonly taskQueue: Task<T>[] = [];
  private nextId = 0;
  private ongoingTasks = 0;
  private closed = false;
  private closeFn: (() => void) | null = null;
  private startTime: number | null = null;
  private results: (T | undefined)[] = [];
  private markers: TaskMark[] = []
  private readonly taskListeners: ((status: TaskStatus<T>) => void)[] = [];
  private readonly queueListeners: ((status: QueueStatus<T>) => void)[] = [];

  constructor(
    private parallelTasks = 1,
  ) {
  }

  add(task: TaskCallback<T>): void;
  add(id: string, callback: TaskCallback<T>): void;
  add(idOrCallback: TaskCallback<T> | string, callback?: TaskCallback<T>): void {
    if (this.closed) {

      return;
    }
    if (this.startTime === null) {
      this.startTime = +new Date();
    }
    const firstArgIsId = typeof idOrCallback === 'string';
    const task: Task<T> = {
      callback: firstArgIsId ? callback : idOrCallback,
      id: firstArgIsId ? idOrCallback : `${this.nextId++}`,
    };
    this.taskQueue.push(task);
    this.start();
  }

  /** To be used with finalize(). Removes all ongoing tasks. */
  reset(): void {
    this.closed = false;
    this.taskQueue.length = 0;
    this.ongoingTasks = 0;
  }

  /**
   * Fire this whenever no more tasks are to be expected. Doesn't purge ongoing queue.
   * Fires callback when all ongoing tasks are finished.
   */
  finalize(closeFn?: () => void): void {
    this.closed = true;
    this.closeFn = closeFn ?? null;
    if (this.ongoingTasks <= 0) {
      this.close();
    }
  }

  listenQueueChanges(listener: (status: QueueStatus<T>) => void): void {
    this.queueListeners.push(listener);
  }

  listenTaskChanges(listener: (status: TaskStatus<T>) => void): void {
    this.taskListeners.push(listener);
  }

  private start(): void {
    this.queueListeners.forEach((listener) => listener({ status: 'START', time: 0, results: [], markers: [] }));
    while (this.taskQueue.length && this.ongoingTasks < this.parallelTasks) {
      const task = this.taskQueue.shift();
      if (!task) {

        return;
      }
      this.ongoingTasks++;
      new Promise(async () => {
        const time = +new Date();
        const markers: TaskMark[] = [];
        const markerFn = (name: string) => {
          const timestamp = +new Date();
          markers.push({
            timestamp,
            name,
            duration: timestamp - (markers[markers.length - 1]?.timestamp ?? time),
          });
        };
        this.taskListeners.forEach((listener) => listener({
          id: task.id,
          status: 'START',
          time: 0,
          markers: [],
          result: undefined,
        }));
        const result: T | undefined = await task?.callback?.({
          marker: markerFn,
        });
        this.results.push(result);
        this.taskListeners.forEach((listener) => listener({
          id: task.id,
          status: 'COMPLETE',
          time: +new Date() - time,
          markers,
          result
        }));
        this.markers.push(...markers);
        this.ongoingTasks = Math.max(0, this.ongoingTasks - 1);
        if (this.closed && this.taskQueue.length === 0 && this.ongoingTasks === 0) {
          this.close();
        }
        this.start();
      });
    }
  }

  private close(): void {
    this.closeFn?.();
    this.closeFn = null;
    this.queueListeners.forEach((listener) => listener({
      status: 'COMPLETE',
      time: this.startTime ? +new Date() - this.startTime : 0,
      markers: this.markers,
      results: this.results,
    }));
    this.results = [];
    this.markers = [];
    this.nextId = 0;
    this.startTime = null;
  }
}
