import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/patient-login' })
  },
  component: Index,
})

function Index() {
  return null
} 