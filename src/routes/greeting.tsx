import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react'

import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { Camera, Sparkles } from 'lucide-react'

import { GreetingCard } from '@/components/GreetingCard'
import { api } from '../../convex/_generated/api'
import { cn } from '@/lib/utils'

type AdventureType = 'tour' | 'foodie' | 'race'

const ADVENTURE_OPTIONS: Array<{
  id: AdventureType
  title: string
  accent: string
  emoji: string
}> = [
  {
    id: 'tour',
    title: 'Skyline Tour',
    accent: 'from-teal-500/40 to-emerald-500/20 text-teal-950',
    emoji: '🧭',
  },
  {
    id: 'foodie',
    title: 'Mythic Foodie',
    accent: 'from-amber-400/50 to-rose-400/20 text-amber-950',
    emoji: '🍝',
  },
  {
    id: 'race',
    title: 'Skyway Race',
    accent: 'from-cyan-500/40 to-blue-500/20 text-cyan-950',
    emoji: '🏁',
  },
]

const MAX_AVATAR_SIZE = 2 * 1024 * 1024

const HERO_TITLES = ['Explorer', 'Pathfinder', 'Chronicle', 'Navigator']
const HERO_SUFFIXES = ['Lumen', 'Starling', 'Wander', 'Morrow', 'Solstice']

const ATMOSPHERE_TILES = [
  {
    title: 'Aurora Bazaar',
    caption: 'Lanterns hum over spice glass.',
    hue: 'from-amber-400/20 to-rose-500/10',
    delay: '0s',
  },
  {
    title: 'Windspindle Run',
    caption: 'Golems chalk lap times in the mist.',
    hue: 'from-cyan-400/20 to-sky-500/10',
    delay: '0.2s',
  },
  {
    title: 'Echo Library',
    caption: 'Holo-shelves whisper route hints.',
    hue: 'from-emerald-400/20 to-lime-500/10',
    delay: '0.4s',
  },
]

const generateHeroName = () => {
  const title = HERO_TITLES[Math.floor(Math.random() * HERO_TITLES.length)]
  const suffix = HERO_SUFFIXES[Math.floor(Math.random() * HERO_SUFFIXES.length)]
  return `${title} ${suffix}`
}

export const Route = createFileRoute('/greeting')({
  ssr: true,
  component: GreetingRoute,
})

function GreetingRoute() {
  const [playerName, setPlayerName] = useState(() => generateHeroName())
  const [hasEditedName, setHasEditedName] = useState(false)
  const [selectedAdventure, setSelectedAdventure] =
    useState<AdventureType>('tour')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [story, setStory] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle',
  )
  const [errorMessage, setErrorMessage] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const createGame = useMutation(api.games.createGame)
  const sendPrompt = useMutation(api.games.sendPrompt)

  const displayName = playerName.trim() || 'Explorer'

  const adventureDetails = ADVENTURE_OPTIONS.find(
    (option) => option.id === selectedAdventure,
  )

  const previewCard = useMemo(
    () => ({
      title: `Welcome, ${displayName}!`,
      subtitle: `${adventureDetails?.title ?? 'CityQuest Path'} awaits.`,
      signature: 'CityQuest Dispatch',
      accentColor: '#0f172a',
      mood: 'celebrate' as const,
      inlineStyles: true,
    }),
    [adventureDetails?.title, displayName],
  )

  const resetStory = useCallback(() => {
    setStory(null)
    setStatus('idle')
    setErrorMessage('')
  }, [])

  const handleFileSelection = useCallback(
    async (file?: File | null) => {
      if (!file) {
        return
      }
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Choose an image to represent your adventurer.')
        return
      }
      if (file.size > MAX_AVATAR_SIZE) {
        setErrorMessage('Please choose an image smaller than 2 MB.')
        return
      }
      setErrorMessage('')
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result)
          resetStory()
        }
      }
      reader.readAsDataURL(file)
    },
    [resetStory],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const file = event.dataTransfer.files?.[0]
      void handleFileSelection(file)
    },
    [handleFileSelection],
  )

  const handleStartGame = useCallback(async () => {
    if (status === 'saving') {
      return
    }
    setStatus('saving')
    setErrorMessage('')
    setStory(null)
    try {
      const gameId = await createGame({
        playerName: displayName,
        adventureType: selectedAdventure,
        avatarDataUrl: avatarPreview ?? undefined,
      })

      const response = await sendPrompt({ gameId })
      setStory(response?.prompt ?? null)
      setStatus('success')
    } catch (error) {
      console.error(error)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to start your CityQuest. Please try again.',
      )
      setStatus('error')
    }
  }, [
    avatarPreview,
    createGame,
    displayName,
    selectedAdventure,
    sendPrompt,
    status,
  ])

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-teal-900 via-cyan-900/80 to-slate-950 py-12 text-white">
      <div className="mx-auto flex w-full max-w-4xl justify-center px-6">
        <section className="w-full max-w-2xl space-y-6 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-slate-900/80 p-8 shadow-inner">
            <div className="pointer-events-none absolute inset-0 opacity-60">
              <div className="absolute -top-10 -right-6 h-40 w-40 rounded-full bg-cyan-300/40 blur-3xl" />
              <div className="absolute top-12 -left-10 h-32 w-32 rounded-full bg-emerald-400/30 blur-2xl animate-pulse" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_55%)]" />
            </div>
            <div className="relative z-10 space-y-4 text-center">
              <h1 className="text-6xl font-black uppercase tracking-[0.25em] text-white drop-shadow-[0_8px_30px_rgba(6,182,212,0.55)]">
                CityQuest
              </h1>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-teal-100">
              What should the guild call you?
            </label>
            <input
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-teal-200/60 focus:border-emerald-300 focus:outline-none"
              value={playerName}
              onFocus={() => {
                if (!hasEditedName) {
                  setPlayerName('')
                  setHasEditedName(true)
                  resetStory()
                }
              }}
              onChange={(event) => {
                setPlayerName(event.target.value)
                setHasEditedName(true)
                resetStory()
              }}
            />
          </div>

          <div className="space-y-3">
            <div
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-white/30 bg-indigo-950/20 p-6 text-center transition',
                isDragging && 'border-emerald-300/80 bg-emerald-200/10',
              )}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Hero profile preview"
                  className="w-full rounded-2xl object-cover shadow-lg"
                  style={{ maxHeight: '220px' }}
                />
              ) : (
                <>
                  <div className="rounded-full bg-white/15 p-3 text-white">
                    <Camera className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-teal-100">
                    Drag & drop or tap to upload
                  </p>
                  <p className="text-xs text-teal-200">
                    Supports live camera capture on mobile
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  void handleFileSelection(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid gap-4 md:grid-cols-3">
              {ADVENTURE_OPTIONS.map((option) => {
                const isActive = option.id === selectedAdventure
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelectedAdventure(option.id)
                      resetStory()
                    }}
                    className={cn(
                      'group relative overflow-hidden rounded-3xl border-2 px-5 py-6 text-left transition hover:-translate-y-1 hover:border-emerald-200',
                      isActive
                        ? 'border-emerald-200 bg-white/20 shadow-xl shadow-emerald-500/30'
                        : 'border-white/10 bg-white/10',
                    )}
                  >
                    <div
                      className={`absolute inset-0 opacity-70 blur-xl transition group-hover:opacity-90 ${option.accent}`}
                    >
                      &nbsp;
                    </div>
                    <div className="relative z-10 flex flex-col gap-3">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 text-2xl">
                        {option.emoji}
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {option.title}
                        </p>
                        <p className="text-xs text-teal-100/80">
                          {isActive ? 'Selected' : 'Tap to begin'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-2xl border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleStartGame()}
            disabled={status === 'saving'}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-4 text-lg font-bold text-emerald-950 shadow-lg shadow-emerald-900/40 transition hover:from-emerald-300 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-5 w-5" />
            {status === 'saving' ? 'Gathering Guild Scrolls...' : 'Start Game'}
          </button>
        </section>
      </div>
    </div>
  )
}
