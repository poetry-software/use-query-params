# use-query-params

A small React hook for reading and updating URL query params declaratively. Stays in sync with the current path (e.g. Inertia navigation) and browser back/forward.

## Install

From GitHub:

```bash
npm install github:poetry-software/use-query-params
# or
yarn add github:poetry-software/use-query-params
# or
pnpm add github:poetry-software/use-query-params
```

## Usage

```tsx
import { useQueryParams } from "use-query-params";

function MyComponent() {
  // Pass the current path so the hook stays in sync when the route changes (e.g. usePage().url with Inertia)
  const [params, setParams] = useQueryParams(
    window.location.pathname + window.location.search
  );

  const page = params.get("page") ?? "1";

  const updatePage = (p: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    setParams(next);
  };

  return (
    <div>
      <span>Page {page}</span>
      <button onClick={() => updatePage(Number(page) + 1)}>Next</button>
    </div>
  );
}
```

With Inertia (Laravel):

```tsx
import { usePage } from "@inertiajs/react";
import { useQueryParams } from "use-query-params";

function UsersIndex() {
  const { url } = usePage();
  const [params, setParams] = useQueryParams(url);
  // ...
}
```

## API

- **`useQueryParams(path: string)`**
  - `path` – Full path (and optional search) for the current page, so the hook can resync when the route changes.
  - Returns `[params, setParams]`:
    - `params` – `URLSearchParams` for the current query string.
    - `setParams(next: URLSearchParams)` – Updates the URL via `history.pushState` and updates local state.

## Notes

- Array-style params work best with the `[]` suffix (e.g. `cols[]=id&cols[]=email`) for consistent behavior across browsers.
- The hook is stateful and subscribes the component to URL changes (including popstate for back/forward).

## License

MIT
