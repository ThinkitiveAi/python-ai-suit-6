import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Container, Title, Text, Button, Stack, Paper, Group, Box } from '@mantine/core'
import { IconLogout, IconHeart } from '@tabler/icons-react'
import { api } from '../services/api'

export const Route = createFileRoute('/patient-dashboard')({
  component: PatientDashboard,
})

function PatientDashboard() {
  const navigate = useNavigate()

  // Authentication check
  useEffect(() => {
    const patientToken = localStorage.getItem('patientToken')
    if (!patientToken) {
      navigate({ to: '/patient-login' })
      return
    }

    // Check if token is valid (in a real app, you'd verify with backend)
    // For demo purposes, we'll just check if it exists
    const patientUser = localStorage.getItem('patientUser')
    if (!patientUser) {
      localStorage.removeItem('patientToken')
      navigate({ to: '/patient-login' })
    }
  }, [navigate])

  const handleLogout = async () => {
    try {
      // Call the logout API
      await api.patient.logout()
    } catch (error) {
      // Even if logout API fails, we should still clear local storage
      console.error('Logout API error:', error)
    } finally {
      // Clear patient authentication
      localStorage.removeItem('patientToken')
      localStorage.removeItem('patientRefreshToken')
      localStorage.removeItem('patientUser')
      
      navigate({ to: '/patient-login' })
    }
  }

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="xl" radius="md">
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconHeart size={24} color="#3b82f6" />
              <Title order={1} size="h2" c="#1e293b">
                Patient Dashboard
              </Title>
            </Group>
            <Button
              variant="outline"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
              color="red"
            >
              Sign Out
            </Button>
          </Group>

          <Text size="lg" c="dimmed">
            Welcome to your personal health dashboard! Here you can view your medical records,
            appointments, and health information.
          </Text>

          <Box p="md" style={{ backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
            <Text size="sm" c="#0369a1">
              This is a demo patient dashboard. In a real application, you would see:
            </Text>
            <Stack gap="xs" mt="sm">
              <Text size="sm" c="#0369a1">• Your upcoming appointments</Text>
              <Text size="sm" c="#0369a1">• Recent test results</Text>
              <Text size="sm" c="#0369a1">• Medication information</Text>
              <Text size="sm" c="#0369a1">• Health records and history</Text>
              <Text size="sm" c="#0369a1">• Communication with your healthcare providers</Text>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  )
} 