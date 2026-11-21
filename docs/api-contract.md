# API contract

Every part of the app builds against this contract. The types live in
[`src/api/types.ts`](../src/api/types.ts) and the mock that implements it lives in
[`src/mocks/`](../src/mocks).

All bodies are JSON. **Prices are stored in cents** (`2499` means $24.99).

## Types

```ts
type Product = {
  id: string
  name: string
  price: number // cents
  category: 'keyboards' | 'ducks' | 'coffee' | 'stickers'
  stock: number
  rating: number
  imageUrl: string
}

type ApiError = {
  error: {
    code: string
    message: string
    details?: Record<string, string>
  }
}

type User = { id: string; name: string; email: string }
```

## Endpoints

| Method | Endpoint                                      | Success                                   | Errors                          |
| ------ | --------------------------------------------- | ----------------------------------------- | ------------------------------- |
| GET    | `/api/products?search=&category=&sort=&page=` | 200 `{ items: Product[], total: number }` | 500                             |
| GET    | `/api/products/:id`                           | 200 `Product`                             | 404                             |
| POST   | `/api/login`                                  | 200 `{ token, user }`                     | 400, 401                        |
| GET    | `/api/me`                                     | 200 `User`                                | 401                             |
| POST   | `/api/orders`                                 | 201 `{ id, status: "queued" }`            | 400, 401, 409 when out of stock |
| GET    | `/api/orders/:id`                             | 200 `{ id, status }`                      | 401, 404                        |

### GET /api/products

| Param      | Values                                                                    | Default    |
| ---------- | ------------------------------------------------------------------------- | ---------- |
| `search`   | Any text, matched against the product name or category (case-insensitive) | none       |
| `category` | `keyboards`, `ducks`, `coffee`, `stickers`                                | all        |
| `sort`     | `featured`, `price-asc`, `price-desc`, `rating`, `name`                   | `featured` |
| `page`     | 1, 2, 3, … Each page holds 24 products.                                   | `1`        |
| `inStock`  | `true` to hide sold-out products                                          | off        |

`total` is the number of products that match the filters on all pages, not just this page.

`sort` values and the page size aren't given in the brief, so they are defined here.
`inStock` is our addition for the "in stock only" filter (D2-2). It is optional, so the
contract still works without it.

### POST /api/login

Request: `{ "email": string, "password": string }`

Response: `{ "token": string, "user": User }`. Send the token on protected requests as
`Authorization: Bearer <token>`.

### POST /api/orders

Request: `{ "items": [{ "productId": string, "quantity": number }] }`. Needs a token.

Optional header: `Idempotency-Key: <unique string>`. If an order was already created with
this key (by the same user), the server returns that same order with 201 and creates nothing
new. The app sends one key per checkout and reuses it on every retry, so a retry after a lost
reply can't create a second order.

Order status moves from `queued` to `processing` to `shipped`.

## Errors

Every error uses the `ApiError` shape. `code` is meant for code to check, and
`message` is meant for developers. The UI shows its own wording, not `message`.

| Status | `code`                                 | When                                                                 | `details`                                            |
| ------ | -------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| 400    | `VALIDATION_ERROR`                     | Login fields missing or invalid; order items empty or invalid        | Field name → problem, e.g. `{ "email": "..." }`      |
| 400    | `INVALID_JSON`                         | The request body isn't valid JSON                                    | none                                                 |
| 401    | `INVALID_CREDENTIALS`                  | Wrong email or password                                              | none                                                 |
| 401    | `UNAUTHORIZED`                         | Missing, invalid or expired token                                    | none                                                 |
| 404    | `PRODUCT_NOT_FOUND`, `ORDER_NOT_FOUND` | No record with that id (another user's order also counts as missing) | none                                                 |
| 409    | `OUT_OF_STOCK`                         | An order asks for more than is in stock                              | Product id → units left, e.g. `{ "prod-0042": "0" }` |
| 500    | `SERVER_ERROR`                         | The product service fails                                            | none                                                 |

## The mock API

The app has no real backend yet. `src/mocks/mock-fetch.ts` has the same signature as
`fetch`, and the API client uses it when `VITE_USE_MOCK_API` isn't `false`. It:

- seeds 5,000 products from a fixed seed, so the data is the same on every load
- keeps stock, orders and sign-ins in memory, so they reset on reload
- waits a short time before answering, like a real network, and stops if the request is cancelled

Demo account: `ada@bugbazaar.dev` / `debug123`.

### Triggering each error on purpose

Open **Mock API controls** in the bottom-left corner of the app (it only shows while the
mock is on).

| Error                     | How to trigger it                                                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 500 on products           | Tick "Product requests fail with 500", then reload or press Retry                                                             |
| 404 on a product          | Open a product id that doesn't exist, e.g. `/products/prod-9999`                                                              |
| 400 on login              | Submit the login form with an empty or badly formed email                                                                     |
| 401 on login              | Use a wrong password                                                                                                          |
| 401 on `/api/me` / orders | Tick "Expire the session", or call without signing in                                                                         |
| 400 on orders             | Send an order with no items                                                                                                   |
| 409 on orders             | Order more than the stock, e.g. a product with only 1–3 left                                                                  |
| 404 on an order           | Open an order id that doesn't exist                                                                                           |
| Slow responses            | Set "Response speed" to Slow                                                                                                  |
| Out-of-order responses    | Set "Response speed" to Random                                                                                                |
| A lost order reply        | Tick "Lose the reply to new orders". The order is saved, the app sees a network error, and Try again gets the same order back |

`src/mocks/mock-fetch.test.ts` checks every status code above.
