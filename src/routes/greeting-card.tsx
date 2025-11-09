import { createFileRoute } from '@tanstack/react-router'
import { renderToStaticMarkup } from 'react-dom/server'

type GreetingMood = 'celebrate' | 'calm' | 'bold'

interface GreetingCardFragmentProps {
  title: string
  subtitle: string
  signature: string
  accentColor: string
  generatedAt?: string
  mood: GreetingMood
}

const gradientMap: Record<GreetingMood, string> = {
  celebrate: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  calm: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  bold: 'linear-gradient(135deg, #f36265 0%, #961276 100%)',
}

export const Route = createFileRoute('/greeting-card')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const payload = parseGreetingParams(new URL(request.url))
        const markup = renderToStaticMarkup(
          <GreetingCardFragment {...payload} />,
        )

        return new Response(markup, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        })
      },
    },
  },
})

function parseGreetingParams(url: URL): GreetingCardFragmentProps {
  const params = url.searchParams

  const rawMood = params.get('mood')
  const mood: GreetingMood = isGreetingMood(rawMood) ? rawMood : 'celebrate'

  return {
    title: params.get('title') ?? 'Hello there!',
    subtitle:
      params.get('subtitle') ??
      'Hope you are finding inspiration around every corner today!',
    signature: params.get('signature') ?? 'Your friends at City Quest',
    accentColor: params.get('accentColor') ?? '#0f172a',
    generatedAt: params.get('generatedAt') ?? undefined,
    mood,
  }
}

function isGreetingMood(value: string | null): value is GreetingMood {
  return value === 'celebrate' || value === 'calm' || value === 'bold'
}

function GreetingCardFragment({
  title,
  subtitle,
  signature,
  accentColor,
  generatedAt,
  mood,
}: GreetingCardFragmentProps) {
  const gradient = gradientMap[mood] ?? gradientMap.celebrate
  const primaryText = accentColor

  return (
    <section
      style={{
        borderRadius: '24px',
        padding: '28px',
        background: gradient,
        color: '#0f172a',
        boxShadow: '0 30px 60px rgba(15, 23, 42, 0.25)',
        fontFamily:
          "Inter, 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        minHeight: '200px',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.35)',
          borderRadius: '999px',
          padding: '6px 16px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#0f172a',
        }}
      >
        <span aria-hidden="true">✨</span>
        Special delivery
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: '28px',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
          color: primaryText,
        }}
      >
        {title}
      </h1>

      <p
        style={{
          margin: 0,
          fontSize: '18px',
          lineHeight: 1.4,
          color: '#0f172a',
        }}
      >
        {subtitle}
      </p>

      <div
        style={{
          marginTop: '4px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          background: 'rgba(255, 255, 255, 0.4)',
          padding: '16px',
          fontSize: '14px',
          lineHeight: 1.5,
          color: '#0f172a',
        }}
      >
        <strong style={{ display: 'block', marginBottom: '4px' }}>
          Remember
        </strong>
        Joy is contagious. Share a little, and you&apos;ll feel it come back even
        brighter.
      </div>

      <footer
        style={{
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          fontSize: '15px',
          color: '#0f172a',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', opacity: 0.85 }}>
            With appreciation,
          </span>
          <strong style={{ fontSize: '18px' }}>{signature}</strong>
          {generatedAt ? (
            <small style={{ opacity: 0.8 }}>
              Sent {formatTimestamp(generatedAt)}
            </small>
          ) : null}
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '999px',
            padding: '6px 14px',
            fontWeight: 600,
          }}
        >
          <span aria-hidden="true">❤️</span>
          city quest
        </div>
      </footer>
    </section>
  )
}

function formatTimestamp(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}
