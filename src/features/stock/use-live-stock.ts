import { useEffect, useRef, useState } from 'react'
import { openStockFeed } from '../../api/stock-feed'
import type { FeedStatus, StockFeed } from '../../api/stock-feed'
import { useAppDispatch } from '../../store/hooks'
import { stockUpdated } from './stock-slice'

// Keeps the stock of these products live while the component is mounted.
// The feed opens when the page opens and closes when it closes (the effect's cleanup),
// so nothing keeps running or reconnecting after you leave.
export function useLiveStock(productIds: readonly string[]): FeedStatus {
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<FeedStatus>('connecting')
  const feedRef = useRef<StockFeed | null>(null)

  useEffect(() => {
    const feed = openStockFeed({
      onUpdates: (updates) => dispatch(stockUpdated(updates)),
      onStatus: setStatus,
    })
    feedRef.current = feed
    return () => {
      feed.close()
      feedRef.current = null
    }
  }, [dispatch])

  // Joined into a string so a new array with the same ids doesn't count as a change.
  const watchedIds = productIds.join(',')
  useEffect(() => {
    feedRef.current?.watch(watchedIds === '' ? [] : watchedIds.split(','))
  }, [watchedIds])

  return status
}
