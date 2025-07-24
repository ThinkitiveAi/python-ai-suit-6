import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Container, Title, Text, Button, Stack, Paper, Group } from '@mantine/core'
import { IconLogout, IconDashboard } from '@tabler/icons-react'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate({ to: '/login' })
  }

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="xl" radius="md">
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <IconDashboard size={24} color="#2563eb" />
              <Title order={1} size="h2" c="#1e293b">
                Provider Dashboard
              </Title>
            </Group>
            <Button
              variant="outline"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
              color="red"
            >
              Logout
            </Button>
          </Group>

          <Text size="lg" c="dimmed">
            Welcome to your healthcare application dashboard! This is where you can manage your patients, 
            appointments, and medical records.
          </Text>

          <Text size="sm" c="dimmed">
            This is a demo dashboard. In a real application, you would see patient lists, 
            appointment schedules, medical records, and other healthcare management features.
          </Text>
        </Stack>
      </Paper>
    </Container>
  )
} 