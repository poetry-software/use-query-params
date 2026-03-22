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
  setParams: (params: URLSearchParams) => void,
  defaults?: DefaultQueryParams,
): void {
  const defaultsSignature =
    defaults === undefined || defaults === null
      ? undefined
      : defaultsValueSignature(defaults);

  useEffect(() => {
    if (defaults === undefined || defaults === null) return;
    const current = searchParamsFromPath(path);
    const merged = mergeMissingDefaults(current, defaults);
    if (merged.toString() !== current.toString()) {
      setParams(merged);
    }
  }, [path, setParams, defaultsSignature]);
}

function searchParamsFromPath(path: string): URLSearchParams {
  const search = new URL(path, window.location.origin).search;
  return new URLSearchParams(search);
}

function defaultsValueSignature(defaults: DefaultQueryParams): string {
  const n = normalizeDefaults(defaults);
  const keys = new Set<string>();
  n.forEach((_value, key) => {
    keys.add(key);
  });
  const sortedKeys = [...keys].sort((a, b) => a.localeCompare(b));
  const parts: string[] = [];
  for (const key of sortedKeys) {
    const values = n.getAll(key).slice().sort((a, b) => a.localeCompare(b));
    for (const value of values) {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      );
    }
  }
  return parts.join("&");
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
