# Authentication

## How it works

1. The login page (`src/features/session/login-page.tsx`) sends `POST /api/login`.
2. On success, Redux stores `{ token, user }` in the `session` slice.
3. `src/api/client.ts` reads the token from the store and sends `Authorization: Bearer <token>`
   on every request.
4. Protected pages (`/checkout`, `/account`, `/orders/:id`) are wrapped in `RequireAuth`.
   Without a token it redirects to `/login`, and the page you wanted goes along in the
   navigation state (`state.from`). After login you are sent back there.
5. If any request that carried a token gets **401**, the client calls `onUnauthorized`, which
   dispatches `sessionExpired()`. The session is cleared, `RequireAuth` redirects to login, and
   the login page says "Your session ended". A 401 from the login form only means a wrong
   password. When you're signed out, that request carries no token, so nothing is cleared.
   (If you open `/login` while already signed in and type a wrong password, the request
   carries your token, so you are signed out. That's the safe side to fail on.)
6. The login button is disabled while a request is running. A `useRef` flag also blocks a
   second submit that arrives before React re-renders, which a double-click can do.

## Where the token is stored, and why

The token lives in **Redux (memory)** and is copied to **`sessionStorage`** so a page reload
doesn't sign you out. `src/store/persistence.ts` does the copying.

| Option               | Survives reload | Shared across tabs | Readable by injected JS (XSS) | Notes                                                            |
| -------------------- | --------------- | ------------------ | ----------------------------- | ---------------------------------------------------------------- |
| Memory only          | No              | No                 | Harder                        | Safest in the browser, but every reload signs you out            |
| **`sessionStorage`** | **Yes**         | **No**             | **Yes**                       | **Our choice.** Cleared when the tab closes                      |
| `localStorage`       | Yes             | Yes                | Yes                           | Stays forever, so a stolen token stays usable longer             |
| `httpOnly` cookie    | Yes             | Yes                | **No**                        | Best for production, but needs a real server and CSRF protection |

**Trade-off:** `sessionStorage` keeps the user signed in across reloads without leaving a
long-lived token on the machine after the tab closes. Its weakness is the same as
`localStorage`: any script running on our page (an XSS bug, a compromised dependency) can read
it. We limit the damage by keeping the token short-lived (the mock's tokens expire after an
hour) and by having no third-party scripts.

**In production** we would use an `httpOnly`, `Secure`, `SameSite` cookie set by the server.
JavaScript can't read it at all, which removes the XSS token-theft risk, but it needs a backend
and CSRF protection, and a mock in the browser can't set one.

The cart is different: it goes in `localStorage` because it isn't secret and should still be
there tomorrow.
