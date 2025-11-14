import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'

import ConvexProvider from '../integrations/convex/provider'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'
import { resolveAppBaseUrl } from '@/utils/base-url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const baseUrl = resolveAppBaseUrl()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <AppsSdkBootstrap baseUrl={baseUrl} /> */}
        <base href={baseUrl} />
        <HeadContent />
      </head>
      <body>
        <ConvexProvider>
          <Header />
          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  )
}

function AppsSdkBootstrap({ baseUrl }: { baseUrl: string }) {
  const inlineScript = `
  (() => {
    const baseUrl = ${JSON.stringify(baseUrl)};
    if (!baseUrl) return;
    try {
      window.__APP_BASE_URL__ = baseUrl;
      const htmlEl = document.documentElement;
      if (htmlEl && !htmlEl.hasAttribute('suppresshydrationwarning')) {
        htmlEl.setAttribute('suppresshydrationwarning', '');
      }
      if (typeof MutationObserver !== 'undefined' && htmlEl) {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.target === htmlEl) {
              const attrName = mutation.attributeName;
              if (attrName && attrName !== 'suppresshydrationwarning') {
                htmlEl.removeAttribute(attrName);
              }
            }
          }
        });
        observer.observe(htmlEl, { attributes: true });
      }

      const appOrigin = new URL(baseUrl, window.location.href).origin;

      const isInIframe = window.self !== window.top;

      const patchHistory = (method) => {
        const original = history[method];
        history[method] = function (state, unused, url) {
          try {
            const parsed = new URL(url ?? '', window.location.href);
            const relative = parsed.pathname + parsed.search + parsed.hash;
            return original.call(this, state, unused, relative);
          } catch {
            return original.call(this, state, unused, url);
          }
        };
      };

      if (isInIframe) {
        patchHistory('replaceState');
        patchHistory('pushState');
      }

      const ensureToolOutputBridge = () => {
        const api = (window.openai = window.openai || {});
        let currentValue = api.toolOutput;
        const dispatch = (detail) => {
          window.dispatchEvent(new CustomEvent('openai-tool-output', { detail }));
        };
        Object.defineProperty(api, 'toolOutput', {
          configurable: true,
          enumerable: true,
          get() {
            return currentValue;
          },
          set(value) {
            currentValue = value;
            dispatch(value);
          },
        });
        if (currentValue !== undefined) {
          dispatch(currentValue);
        }
      };
      ensureToolOutputBridge();

      window.addEventListener(
        'click',
        (event) => {
          const target = event.target instanceof Element ? event.target.closest('a') : null;
          if (!target || !target.href) return;
          const parsed = new URL(target.href, window.location.href);
          if (parsed.origin !== window.location.origin && parsed.origin !== appOrigin) {
            if (window.openai?.openExternal) {
              event.preventDefault();
              try {
                window.openai.openExternal({ href: target.href });
              } catch {
                // fall back silently
              }
            }
          }
        },
        true,
      );

      if (!isInIframe || window.location.origin === appOrigin) {
        return;
      }

      const parseUrl = (input) => {
        try {
          if (typeof input === 'string') {
            return new URL(input, window.location.href);
          }
          if (typeof URL !== 'undefined' && input instanceof URL) {
            return new URL(input.toString());
          }
          if (typeof Request !== 'undefined' && input instanceof Request) {
            return new URL(input.url);
          }
        } catch {
          return null;
        }
        return null;
      };

      const originalFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        try {
          const url = parseUrl(input);
          if (url && url.origin === window.location.origin) {
            const target = new URL(baseUrl);
            target.pathname = url.pathname;
            target.search = url.search;
            target.hash = url.hash;
            return originalFetch(target.toString(), { ...init, mode: 'cors' });
          }
        } catch (error) {
          console.warn('Fetch rewrite failed', error);
        }
        return originalFetch(input, init);
      };
    } catch (error) {
      console.warn('ChatGPT bootstrap failure', error);
    }
  })();
  `

  return (
    <>
      <base href={baseUrl} />
      <script
        dangerouslySetInnerHTML={{
          __html: inlineScript,
        }}
      />
    </>
  )
}
