import React from "react";
import { createRoot, Root } from "react-dom/client";
import { ScoreBoardWidget } from "../../components/ScoreBoardWidget";
import ConvexProvider from '../../integrations/convex/provider'
import * as TanstackQuery from '../../integrations/tanstack-query/root-provider'

import "../../styles.css";

const CONTAINER_ID = "tanstack-app-root";

function ensureRoot(): Root {
  const container = document.getElementById(CONTAINER_ID);
  if (!container) {
    throw new Error(`Container #${CONTAINER_ID} not found`);
  }

  let root = (container as any)._reactRoot as Root | undefined;
  if (!root) {
    root = createRoot(container);
    (container as any)._reactRoot = root;
  }
  return root;
}

function render() {
    const rqContext = TanstackQuery.getContext()
  ensureRoot().render(
    <React.StrictMode>
         <TanstackQuery.Provider {...rqContext}>
         <ConvexProvider>
            <ScoreBoardWidget />
        </ConvexProvider>
         </TanstackQuery.Provider>
    </React.StrictMode>
  );
}

render();

