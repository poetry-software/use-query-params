import { useEffect } from "react"

export type DefaultQueryParams =
  | URLSearchParams
  | Record<string, DefaultQueryParamValue | undefined | null>;

export type DefaultQueryParamValue =
  | string
  | number
  | boolean
  | readonly string[];

export type UseDefaultParamsOptions = {
  url: string
  setParams: (params: URLSearchParams) => void
  defaults?: DefaultQueryParams
}

export function useDefaultParams({
  url,
  setParams,
  defaults,
}: UseDefaultParamsOptions): void {
  useEffect(() => {
    if (!defaults) return;

    const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : ""
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
  }, [url, setParams, defaults])
}
