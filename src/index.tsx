import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "lib/store";
import { ErrorBoundary } from "react-error-boundary";
import NotFound from "components/NotFound/NotFound";
import { PersistGate } from "redux-persist/integration/react";

import "./index.css";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary fallback={<NotFound />}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
