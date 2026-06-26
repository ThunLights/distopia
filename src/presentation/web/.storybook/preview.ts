import "../src/app.css";
import { setupFetchMock } from "../src/mocks/fetch";
import type { Preview } from "@storybook/sveltekit";

const preview: Preview = {
  beforeEach() {
    const fetchSpy = setupFetchMock();

    // Prevent cross-document navigations (e.g. location.href = "/") from loading
    // the Storybook app inside the preview iframe.
    const abortController = new AbortController();
    if ("navigation" in window) {
      (window as Window & { navigation: EventTarget }).navigation.addEventListener(
        "navigate",
        (e: Event) => {
          const nav = e as Event & { destination: { sameDocument: boolean }; cancelable: boolean };
          if (!nav.destination.sameDocument && nav.cancelable) e.preventDefault();
        },
        { signal: abortController.signal },
      );
    }

    return () => {
      fetchSpy.mockRestore();
      abortController.abort();
    };
  },
  parameters: {
    backgrounds: {
      default: "gray",
      options: {
        gray: { name: "Dark", value: "#313338" },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
