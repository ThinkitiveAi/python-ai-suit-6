import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Container, Title, Text, Button, Stack, Paper, Group, Box } from '@mantine/core'
import { IconLogout, IconHeart, IconUser } from '@tabler/icons-react'

export const Route = createFileRoute('/patient-dashboard')({
  component: PatientDashboard,
})

function PatientDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate({ to: '/patient-login' })
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

          <Group justify="center" mt="md">
            <Button
              variant="subtle"
              leftSection={<IconUser size={16} />}
              onClick={() => navigate({ to: '/login' })}
            >
              Switch to Provider Login
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  )
} 