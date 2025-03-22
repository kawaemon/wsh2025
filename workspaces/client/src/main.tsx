import '@wsh-2025/client/src/setups/luxon';
import '@unocss/reset/tailwind-compat.css';

// eslint-disable-next-line import/no-unresolved
import 'virtual:uno.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { StoreProvider } from '@wsh-2025/client/src/app/StoreContext';
import { createRoutes } from '@wsh-2025/client/src/app/createRoutes';
import { createStore } from '@wsh-2025/client/src/app/createStore';

function main() {
  const store = createStore({});
  const router = createBrowserRouter(createRoutes(store), {});

  createRoot(document).render(
    <StrictMode>
      <StoreProvider createStore={() => store}>
        <RouterProvider router={router} />
      </StoreProvider>
    </StrictMode>,
  );
}

main();
