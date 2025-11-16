import { TakePictureWidget } from '@/components/TakePictureWidget'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/picture')({
  ssr: true,
  component: RouteComponent,
})

function RouteComponent() {
  return <TakePictureWidget />
}
