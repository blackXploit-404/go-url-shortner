import { useState } from 'preact/hooks'
import { siGo, siPreact } from 'simple-icons/icons'

export function App() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setShortUrl('')
    setCopied(false)

    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      setError('Enter a valid URL to shorten.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: trimmedUrl }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Could not shorten the URL.')
      }

      const data = await response.json()
      setShortUrl(data.short_url ?? '')
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shortUrl) return

    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main class="min-h-screen w-full bg-white text-zinc-950">
      <section class="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
        <div class="w-full space-y-8">
          <header class="space-y-3">
            <p class="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
              URL Shortener
            </p>
            <h1 class="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Shorten links.
            </h1>
            <p class="max-w-xl text-base leading-7 text-zinc-600">
              Paste a URL, generate a short link, and copy it. No extra bs,
              no clutter 🗿.
            </p>
          </header>

          <form class="space-y-3" onSubmit={handleSubmit}>
            <label class="block text-sm font-medium text-zinc-700" for="url-input">
              Original URL
            </label>
            <div class="flex flex-col gap-3 sm:flex-row">
              <input
                id="url-input"
                type="url"
                name="url"
                placeholder="https://example.com/very/long/link"
                value={url}
                onInput={(event) => setUrl(event.currentTarget.value)}
                class="h-12 min-w-0 flex-1 border border-zinc-200 bg-white px-4 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400"
                required
              />
              <button
                type="submit"
                disabled={loading}
                class="h-12 border border-zinc-950 bg-zinc-950 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Shortening...' : 'Shorten'}
              </button>
            </div>
          </form>

          {error ? <p class="text-sm text-zinc-600">{error}</p> : null}

          {shortUrl ? (
            <section class="space-y-3 border-t border-zinc-200 pt-6">
              <p class="text-sm font-medium text-zinc-700">Short URL</p>
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  class="break-all text-sm text-zinc-950 underline underline-offset-4"
                  href={shortUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortUrl}
                </a>
                <div class="flex gap-3 sm:ml-auto">
                  <button
                    type="button"
                    onClick={handleCopy}
                    class="h-11 border border-zinc-200 px-4 text-sm font-medium text-zinc-950"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    class="inline-flex h-11 items-center border border-zinc-200 px-4 text-sm font-medium text-zinc-950"
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                </div>
              </div>
            </section>
          ) : null}

          <footer class="border-t border-zinc-200 pt-6">
            <div class="flex flex-col gap-2 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
              <p class="flex items-center gap-2">
                <svg
                  class="h-6 w-6 text-zinc-700"
                  viewBox={`0 0 ${siGo.width} ${siGo.height}`}
                  aria-hidden="true"
                  role="img"
                >
                  <path d={siGo.path} fill="currentColor" />
                </svg>
                Backend powered by Go
              </p>
              <p class="flex items-center gap-2">
                <svg
                  class="h-6 w-6 text-zinc-700"
                  viewBox={`0 0 ${siPreact.width} ${siPreact.height}`}
                  aria-hidden="true"
                  role="img"
                >
                  <path d={siPreact.path} fill="currentColor" />
                </svg>
                Frontend built with Preact
              </p>
            </div>
          </footer>
        </div>
      </section>
    </main>
  )
}
