import { useState } from 'react'
import type { ReactElement } from 'react'
import { CRASH_EVENT, MOCK_LATENCIES, readMockSettings, saveMockSettings } from './mock-settings'
import { dropStockSockets } from './mock-stock-socket'
import type { MockLatency, MockSettings } from './mock-settings'

function isMockLatency(value: string): value is MockLatency {
  return MOCK_LATENCIES.some((latency) => latency === value)
}

// A small panel for triggering slow responses and errors on purpose.
// It only appears while the app runs on the mock API.
export function MockControls(): ReactElement {
  const [settings, setSettings] = useState<MockSettings>(readMockSettings)

  function update(changes: Partial<MockSettings>): void {
    const next = { ...settings, ...changes }
    setSettings(next)
    saveMockSettings(next)
  }

  return (
    <details className="mock-controls">
      <summary>Mock API controls</summary>
      <p>Changes apply to the next request. Use Retry or reload to see them.</p>
      <label>
        Response speed
        <select
          value={settings.latency}
          onChange={(event) => {
            if (isMockLatency(event.target.value)) update({ latency: event.target.value })
          }}
        >
          <option value="none">Instant</option>
          <option value="normal">Normal (0.3 s)</option>
          <option value="slow">Slow (2 s)</option>
          <option value="random">Random (0.1–1.5 s, out of order)</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.failProductRequests}
          onChange={(event) => update({ failProductRequests: event.target.checked })}
        />
        Product requests fail with 500
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.rejectTokens}
          onChange={(event) => update({ rejectTokens: event.target.checked })}
        />
        Expire the session (401 on protected requests)
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.loseOrderReplies}
          onChange={(event) => update({ loseOrderReplies: event.target.checked })}
        />
        Lose the reply to new orders (order is saved)
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.stockFeedDown}
          onChange={(event) => {
            update({ stockFeedDown: event.target.checked })
            // Going down cuts the open connections too. Turn it off to watch the feed recover.
            if (event.target.checked) dropStockSockets()
          }}
        />
        Live stock server is down (drops the connection)
      </label>
      <button
        type="button"
        className="button secondary"
        onClick={() => window.dispatchEvent(new Event(CRASH_EVENT))}
      >
        Crash this page (render error)
      </button>
    </details>
  )
}
