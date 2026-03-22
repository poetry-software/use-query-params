import { useCallback, useEffect, useMemo, useState } from "react";
import type { DefaultQueryParams } from "./use-default-params";

/**
 * Hook for declaratively reading and updating query params in the URL.
 * Accepts the current path (e.g. from usePage().url when using Inertia) so it can
 * stay in sync when the page changes. Returns the fully-qualified URL search params
 * object from the core JavaScript API.
 * Array-type params should always use the `[]` suffix to avoid Safari's repeated param parsing.
 * E.g. `col=id&col=email` should be `cols[]=id&cols[]=email`.
 * The setParams call will update via window.history.pushState so the URL stays in sync.
 * Optional `defaults` fills in missing query keys when the path changes (first visit or
 * navigation) without overwriting params already present in the URL. Pass a
 * {@link URLSearchParams} or a plain object; array values are serialized with a `[]` key
 * suffix unless the key already ends with `[]`.
 * N.B. This hook is stateful and automatically subscribes any component that uses it
 * to the state of the URL. It's primarily intended to be used to bind the local state
 * of a view to the URL via query params and not as a state management tool.
 * Please keep your actual component state independent of the URL query params.
 */
export function useQueryParams(
  path: string,
  defaults?: DefaultQueryParams,
): [URLSearchParams, (params: URLSearchParams) => void] {
  const [searchString, setSearchString] = useState(() =>
    typeof window === "undefined" ? "" : window.location.search,
  );

  // Sync when the path changes (e.g. Inertia navigation when caller passes usePage().url)
  useEffect(() => {
    setSearchString(new URL(path, window.location.origin).search);
  }, [path]);

  // Sync from browser Back/Forward
  useEffect(() => {
    const handlePopState = () => {
      setSearchString(window.location.search);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const params = useMemo(
    () => new URLSearchParams(searchString),
    [searchString],
  );

  const setParams = useCallback((next: URLSearchParams) => {
    const newUrl = new URL(window.location.href);
    newUrl.search = next.toString();
    /**
     * This pushState call needs the empty state object primarily so
     * Safari keeps the entry for forward navigation. Some browsers won't
     * preserve the entry if it's null.
     */
    window.history.pushState({}, "", newUrl.toString());
    setSearchString(newUrl.search);
  }, []);

  useEffect(() => {
    if (!defaults) return;

    const search = path.includes("?") ? path.slice(path.indexOf("?") + 1) : ""
    const current = new URLSearchParams(search)
    const canonical = new URLSearchParams(current)

    for (const [key, value] of Object.entries(defaults)) {
      if (!canonical.has(key)) {
        canonical.set(key, value)
      }
    }

    if (canonical.toString() !== current.toString()) {
      setParams(canonical)
    }
  }, [path, setParams, defaults])

  return [params, setParams];
}
