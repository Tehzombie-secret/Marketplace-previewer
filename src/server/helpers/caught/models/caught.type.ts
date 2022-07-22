export type Caught<T, E = unknown> = [error: null, value: T] | [error: E, value: null];
