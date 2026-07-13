# API Specification (mock → Phase 2)

All data access goes through the **`AgroApi`** interface in
[`src/services/api.ts`](src/services/api.ts). Phase 1 ships a `MockApi`
(in-memory, from `src/data/mockData.ts`) and a `HttpApi` stub. The active
implementation is chosen by env:

```
VITE_USE_MOCK_API=true    # MockApi (default, Phase 1)
VITE_USE_MOCK_API=false   # HttpApi → fetch(VITE_API_BASE_URL + path)
VITE_API_BASE_URL=http://localhost:4000/api
```

**Phase 2 contract:** implement the endpoints below so responses match the
TypeScript shapes in [`src/types/index.ts`](src/types/index.ts). No component
changes are required — only fill in `HttpApi`.

## Endpoints

| Method call                     | HTTP (HttpApi)              | Returns                |
| ------------------------------- | --------------------------- | ---------------------- |
| `login(payload)`                | `POST /auth/login`          | `AuthenticatedUser`    |
| `register(payload)`             | `POST /auth/register`       | `AuthenticatedUser`    |
| `getCommodityPrices()`          | `GET /prices`               | `CommodityPrice[]`     |
| `getWeather(region)`            | `GET /weather/:region`      | `WeatherForecast`      |
| `getAdvisories()`               | `GET /advisories`           | `Advisory[]`           |
| `getProducts(query?)`           | `GET /products?…`           | `Paginated<Product>`   |
| `getProduct(id)`                | `GET /products/:id`         | `ProductDetail`        |
| `getCooperatives()`             | `GET /cooperatives`         | `Cooperative[]`        |
| `getCooperative(id)`            | `GET /cooperatives/:id`     | `Cooperative`          |
| `getUsers()`                    | `GET /users`                | `User[]`               |
| `getSupplierProfile(name)`      | `GET /suppliers/profile?name=…` | `Supplier \| null`  |

### Auth

```ts
LoginPayload    = { phone: string; pin: string; role: 'farmer'|'supplier'|'admin' }
RegisterPayload = { name: string; phone: string; pin: string; role: 'farmer'|'supplier'; region: RegionId }
AuthenticatedUser = { id, name, role, phone, region, avatarInitials }
```

- `login` → **401** `{ status, message }` on bad credentials.
- `register` → **409** if the phone already exists.
- Phase 1 stores sessions in localStorage; Phase 2 replaces this with JWT.
- `getSupplierProfile` → **404** when no supplier matches `name`; `HttpApi`
  maps that to `null` rather than throwing (all other non-2xx still throw
  `ApiError`).

### Products & pagination

```ts
ProductQuery = {
  cropType?, region?, minPrice?, maxPrice?,
  sort?: 'price-asc'|'price-desc'|'newest'|'rating',
  search?, page?: number, pageSize?: number
}
Paginated<T> = { items: T[]; total: number; page: number; pageSize: number; hasMore: boolean }
```

`GET /products` must accept those query params and return the paginated envelope.
`ProductDetail` extends `Product` with `longDescription`, `priceHistory:
PricePoint[]`, and `reviews: Review[]`.

## Errors

Errors are objects of shape `ApiError = { status: number; message: string }`
(see `isApiError`). The UI maps `status` to localized messages (e.g. 401/409 on
auth); other failures fall back to a generic localized message.

## Notes for Phase 2

- Return **localized dynamic content** (commodity names, advisories, product and
  supplier text) per the `Accept-Language` header — the frontend only translates
  UI chrome, not data.
- Keep response field names identical to `src/types/index.ts`; add fields
  additively.
