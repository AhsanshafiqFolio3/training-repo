// What a mock handler receives: the parsed parts of one request.
export type MockRequest = {
  url: URL
  // Values taken from the path, e.g. { id: 'prod-0001' } for /api/products/:id
  params: Record<string, string>
  headers: Headers
  body: unknown
}
