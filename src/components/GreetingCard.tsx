import { Heart } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export interface GreetingCardProps {
  title: string
  subtitle: string
  signature?: string
  accentColor?: string
  mood?: 'celebrate' | 'calm' | 'bold'
  inlineStyles?: boolean
}

const moodGradients: Record<GreetingCardProps['mood'], string> = {
  celebrate: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  calm: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  bold: 'linear-gradient(135deg, #f36265 0%, #961276 100%)',
}

export function GreetingCard({
  title,
  subtitle,
  signature,
  accentColor = '#0f172a',
  mood = 'celebrate',
  inlineStyles = false,
}: GreetingCardProps) {
  const background = moodGradients[mood] ?? moodGradients.celebrate
  const primaryText = accentColor

  return (
    <Card
      className="greeting-card w-full max-w-xl border-none text-slate-900 shadow-2xl"
      style={
        inlineStyles
          ? {
              background,
              color: primaryText,
              boxShadow: '0 25px 50px rgba(15, 23, 42, 0.2)',
            }
          : { background }
      }
    >
      <CardHeader className="gap-3 text-left text-slate-900">
        <CardTitle
          data-role="greeting-title"
          className="text-3xl font-bold tracking-tight text-slate-900"
        >
          {title}
        </CardTitle>
        <CardDescription
          data-role="greeting-subtitle"
          className="text-lg text-slate-800"
        >
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-base text-slate-900">
        <p className="text-slate-800">
          Here&apos;s a burst of encouragement to keep you moving forward. Take
          a deep breath, smile big, and stay curious—adventures await!
        </p>
        <div className="rounded-2xl border border-white/50 bg-white/40 px-4 py-3 text-sm text-slate-700 backdrop-blur">
          <p className="font-semibold text-slate-900">Remember</p>
          <p>
           ... because you're a badass!
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-slate-900">
        <div className="flex flex-col leading-tight">
          <span className="text-sm text-slate-600">With love,</span>
          <strong data-role="greeting-signature" className="text-lg">
            {signature}
          </strong>
        </div>
        <div
          className="flex items-center gap-1 rounded-full bg-white/30 px-3 py-1 text-sm font-medium text-slate-800 backdrop-blur"
          style={
            inlineStyles
              ? {
                  border: '1px solid rgba(255,255,255,0.6)',
                }
              : undefined
          }
        >
          <Heart className="h-4 w-4" />
          city quest
        </div>
      </CardFooter>
    </Card>
  )
}

export const DEFAULT_GREETING_PROPS: GreetingCardProps = {
  title: 'Hello from City Quest!',
  subtitle: 'Hope you are finding inspiration around every corner today!',
  signature: 'Your friends at City Quest',
  accentColor: '#0f172a',
  mood: 'celebrate',
}
