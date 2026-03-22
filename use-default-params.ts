import { useEffect } from "react"

export type DefaultQueryParamValue =
  | string
  | number
  | boolean
  | readonly string[];

export type DefaultQueryParams =
  | URLSearchParams
  | Record<string, DefaultQueryParamValue | undefined | null>;

export function useDefaultParams(
  path: string,
  params: URLSearchParams,
  setParams: (params: URLSearchParams) => void,
  defaults?: DefaultQueryParams,
): void {
  useEffect(() => {
    if (defaults === undefined || defaults === null) return;
    const merged = mergeMissingDefaults(params, defaults);
    if (merged.toString() !== params.toString()) {
      setParams(merged);
    }
  }, [path, params, setParams, defaults]);
}

function arrayParamKey(baseKey: string): string {
  return baseKey.endsWith("[]") ? baseKey : `${baseKey}[]`;
}

function appendDefaultEntry(
  target: URLSearchParams,
  key: string,
  value: DefaultQueryParamValue,
): void {
  if (Array.isArray(value)) {
    const paramKey = arrayParamKey(key);
    for (const item of value) {
      target.append(paramKey, String(item));
    }
  } else {
    target.set(key, String(value));
  }
}

function recordToDefaultSearchParams(
  defaults: Record<string, DefaultQueryParamValue | undefined | null>,
): URLSearchParams {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(defaults)) {
    if (value === undefined || value === null) continue;
    appendDefaultEntry(out, key, value);
  }
  return out;
}

function normalizeDefaults(
  defaults: DefaultQueryParams,
): URLSearchParams {
  return defaults instanceof URLSearchParams
    ? new URLSearchParams(defaults)
    : recordToDefaultSearchParams(defaults);
}

function mergeMissingQueryParams(
  current: URLSearchParams,
  defaults: URLSearchParams,
): URLSearchParams {
  const out = new URLSearchParams(current);
  const keys = new Set<string>();
  defaults.forEach((_value, key) => {
    keys.add(key);
  });
  for (const key of keys) {
    if (!out.has(key)) {
      for (const v of defaults.getAll(key)) {
        out.append(key, v);
      }
    }
  }
  return out;
}

function mergeMissingDefaults(
  current: URLSearchParams,
  defaults: DefaultQueryParams,
): URLSearchParams {
  return mergeMissingQueryParams(current, normalizeDefaults(defaults));
}
