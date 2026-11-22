/**
 * A stand-in for `storybook/test` in the config tool. The components page renders the stories, which import it for
 * their `play` tests and `fn()` spies, but never runs those tests, so the real thing (testing-library and assertions,
 * most of the page's download) isn't needed. `fn()` returns a plain function; the rest are never called here.
 */
const unused = () => {
  throw new Error('storybook/test is only for Storybook: the config tool doesn’t run story tests.');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fn = <T extends (...args: any[]) => any>(impl?: T) => ((...args: Parameters<T>) => impl?.(...args)) as T;
export const expect = unused;
export const waitFor = unused;
export const within = unused;
export const userEvent = new Proxy({}, { get: () => unused });
export const screen = new Proxy({}, { get: () => unused });
