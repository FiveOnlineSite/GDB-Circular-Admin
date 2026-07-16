import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getGlobalLoaderSnapshot, subscribeToGlobalLoader } from "../lib/utils/globalLoader";

const GlobalLoaderContext = createContext({
  isLoading: false,
  activeRequestCount: 0,
});

export function GlobalLoaderProvider({ children }) {
  const [state, setState] = useState(getGlobalLoaderSnapshot());

  useEffect(() => {
    return subscribeToGlobalLoader((isLoading, activeRequestCount) => {
      setState({ isLoading, activeRequestCount });
    });
  }, []);

  const value = useMemo(
    () => ({
      isLoading: state.isLoading,
      activeRequestCount: state.activeRequestCount,
    }),
    [state.activeRequestCount, state.isLoading]
  );

  return <GlobalLoaderContext.Provider value={value}>{children}</GlobalLoaderContext.Provider>;
}

export function useGlobalLoader() {
  return useContext(GlobalLoaderContext);
}
