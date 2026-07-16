let activeRequestCount = 0;
const listeners = new Set();

function notify() {
  const isLoading = activeRequestCount > 0;
  listeners.forEach((listener) => listener(isLoading, activeRequestCount));
}

export function startGlobalLoader() {
  activeRequestCount += 1;
  notify();
}

export function stopGlobalLoader() {
  activeRequestCount = Math.max(0, activeRequestCount - 1);
  notify();
}

export function subscribeToGlobalLoader(listener) {
  listeners.add(listener);
  listener(activeRequestCount > 0, activeRequestCount);

  return () => {
    listeners.delete(listener);
  };
}

export function getGlobalLoaderSnapshot() {
  return {
    isLoading: activeRequestCount > 0,
    activeRequestCount,
  };
}
