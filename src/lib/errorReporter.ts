// Intentionally a no-op in production: shipped sites must NEVER surface a
// runtime error overlay or report resource failures (e.g. a missing image)
// to the end user or to the published deployment. Do not reintroduce a
// global window.onerror reporter here. Broken images degrade gracefully via
// the SafeImage component instead.
export function reportClientError(payload: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Client error report", payload);
  }
}
