import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Check if user is already authenticated
    const providerToken = localStorage.getItem('providerToken')
    const patientToken = localStorage.getItem('patientToken')
    
    if (providerToken) {
      throw redirect({ to: '/dashboard' })
    } else if (patientToken) {
      throw redirect({ to: '/patient-dashboard' })
    } else {
      // Default to patient login if not authenticated
      throw redirect({ to: '/patient-login' })
    }
  },
  component: Index,
})

function Index() {
  return null
} 