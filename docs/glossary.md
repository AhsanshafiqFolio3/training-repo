# Glossary

Six architecture terms, each with where it shows up in The Bug Bazaar.

## Latency

**What it is:** the wait between asking for something and getting the answer. It's
different from speed of work: a server can answer in 2 ms, but if the request has to
travel across the world, the user still waits 200 ms.

**In the store:** the Mock API controls have a **Response speed** setting that adds latency
to every request (none, normal, slow or random). We work around latency in three places:

- The product list asks for the next page when the **Load more products** button is still 800 px
  below the screen, so the products usually arrive before you scroll to them.
- The search waits until you stop typing before it sends a request, so fast typing doesn't
  queue up a request per letter.
- Results are cached for 60 seconds, so going back to the shop has no wait at all.

## Idempotency

**What it is:** an action is idempotent if doing it twice has the same effect as doing it
once. Reading a product is naturally idempotent; placing an order is not, unless we make it so.

**In the store:** checkout sends an `Idempotency-Key` header with each order. If the reply
is lost and the user presses **Try again**, the server sees the same key and returns the
order it already made, instead of making (and charging for) a second one. Try it with
**Lose the reply to new orders** in the Mock API controls. See D3-2 and
[orders.md](orders.md).

## Horizontal scaling

**What it is:** handling more traffic by adding more machines, instead of buying one
bigger machine (that's vertical scaling). It only works if any machine can handle any
request, so nothing important may live in one server's memory.

**In the store:** the front end is static files, so it scales horizontally with no work:
the CDN serves the same files from many servers. In [orders.md](orders.md), the order
service and the payment and email workers scale the same way: on a sale day you run more
of them. Our mock is the counter-example: it keeps orders in browser memory, so two copies
of it would each have their own orders and their own idempotency keys. A real backend
keeps those in a shared database for exactly that reason.

## CDN (content delivery network)

**What it is:** a network of servers around the world that keep copies of your files, so
each user downloads them from a server near them. That cuts latency and takes load off
the main server.

**In the store:** the deploy workflow publishes the built site to GitHub Pages, which
serves it through a CDN. Vite helps by putting a hash of the content in each file name
(`index-bt8Ok_TX.js`): a changed file gets a new name, so the CDN and browsers can keep the
old one cached without ever showing stale code. Only `index.html` keeps its name, and it is
small and checked again on each visit.

## Cache invalidation

**What it is:** throwing away a cached copy when the real data has changed, so nobody sees
the old version. The hard part is knowing _when_ something changed.

**In the store:** product results are cached for 60 seconds (`src/shared/request-cache.ts`).
We invalidate in three ways:

- **On a known change:** after an order, `invalidateCache('product')` drops every cached
  product result, and `stockReset()` drops the live stock values, because the stock just
  changed.
- **When the user asks:** **Try again** always goes to the server.
- **By age:** anything older than 60 seconds is fetched again.

Orders and the signed-in user are never cached, because their whole point is the current
status.

## Eventual consistency

**What it is:** different copies of the same data can disagree for a short time, but if
nothing else changes they all end up agreeing. You accept a little staleness in exchange
for speed or for a system that keeps working when one part is slow.

**In the store:**

- The product list can show stock that is up to a minute old (from the cache), while the
  live stock feed and the server already have newer numbers. They catch up when a stock
  message arrives or the cache expires. If you order more than is really left, the server
  is the final word and answers 409.
- An order is `queued` when you place it, and only becomes `processing` and `shipped` as the
  workers get to it. The confirmation email can arrive after that, or later if email is down
  ([orders.md](orders.md)). Everything agrees in the end.
