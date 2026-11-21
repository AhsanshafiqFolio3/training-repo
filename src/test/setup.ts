import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// findBy… and waitFor give up after 1 s by default. A slow CI runner can need longer to
// render the first page of products, so wait up to 5 s before failing.
configure({ asyncUtilTimeout: 5_000 })

afterEach(cleanup)
