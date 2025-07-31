import { useState, useEffect } from 'react'
import { useForm } from '@mantine/form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { notifications } from '@mantine/notifications'
import {
  Container, Paper, Title, Text, TextInput, PasswordInput, Checkbox, Button, Group, Stack, Divider, Box, Center, rem, Badge,
} from '@mantine/core'
import {
  IconUser, IconLock, IconArrowRight, IconCheck, IconX, IconStethoscope, IconUsers, IconUserCircle,
} from '@tabler/icons-react'
import { api } from '../services/api'
import type { ProviderLoginRequest } from '../services/api'

export const Route = createFileRoute('/login')({
  component: Login,
})

interface LoginForm {
  emailOrPhone: string
  password: string
  rememberMe: boolean
}

function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check if user is already authenticated
  useEffect(() => {
    const providerToken = localStorage.getItem('providerToken')
    if (providerToken) {
      navigate({ to: '/dashboard' })
    }
  }, [navigate])

  const form = useForm<LoginForm>({
    initialValues: {
      emailOrPhone: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      emailOrPhone: (value) => {
        if (!value) return 'Email or phone number is required'
        
        // Check if it's an email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(value)) return null
        
        // Check if it's a phone number (basic validation)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        if (phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) return null
        
        return 'Please enter a valid email or phone number'
      },
      password: (value) => {
        if (!value) return 'Password is required'
        if (value.length < 6) return 'Password must be at least 6 characters'
        return null
      },
    },
  })

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true)
    
    try {
      const loginData: ProviderLoginRequest = {
        email: values.emailOrPhone,
        password: values.password,
      }

      const response = await api.provider.login(loginData)

      if (response.success && response.data) {
        // Store authentication tokens and user data
        const { access_token, refresh_token, provider } = response.data
        
        localStorage.setItem('providerToken', access_token)
        localStorage.setItem('providerRefreshToken', refresh_token)
        localStorage.setItem('providerUser', JSON.stringify({
          email: provider.email,
          name: `${provider.first_name} ${provider.last_name}`,
          role: 'provider',
          ...provider
        }))
        
        notifications.show({
          title: 'Login Successful',
          message: `Welcome back, ${provider.first_name}! Redirecting to dashboard...`,
          color: 'green',
          icon: <IconCheck size={16} />,
        })
        
        navigate({ to: '/dashboard' })
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (error) {
      notifications.show({
        title: 'Login Failed',
        message: error instanceof Error ? error.message : 'Invalid email or password. Please try again.',
        color: 'red',
        icon: <IconX size={16} />,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    notifications.show({
      title: 'Password Recovery',
      message: 'Password recovery feature will be implemented soon.',
      color: 'blue',
    })
  }

  const handleRegister = () => {
    navigate({ to: '/register' })
  }

  const handleSwitchToPatient = () => {
    navigate({ to: '/patient-login' })
  }

  return (
    <Container size="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      {/* Portal Switcher */}
      <Box
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Button
          variant="light"
          size="sm"
          leftSection={<IconUsers size={16} />}
          rightSection={<IconArrowRight size={14} />}
          onClick={handleSwitchToPatient}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            border: 'none',
            fontWeight: 500,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
            },
          }}
        >
          Switch to Patient Portal
        </Button>
      </Box>

      <Paper
        shadow="md"
        p="xl"
        radius="md"
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <Center mb="xl">
          <Stack align="center" gap="xs">
            <Box
              style={{
                width: rem(60),
                height: rem(60),
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: rem(8),
              }}
            >
              <IconStethoscope size={32} color="white" />
            </Box>
            <Title order={1} size="h2" ta="center" c="#1e293b">
              Provider Login
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              Access your healthcare application dashboard
            </Text>
            <Badge 
              color="blue" 
              variant="light" 
              size="sm"
              style={{ 
                marginTop: rem(8),
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                border: '1px solid #bfdbfe',
              }}
            >
              <IconUserCircle size={12} style={{ marginRight: '4px' }} />
              Healthcare Professional Portal
            </Badge>
          </Stack>
        </Center>

        {/* Login Form */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email or Phone Number"
              placeholder="Enter your email or phone number"
              leftSection={<IconUser size={16} />}
              required
              {...form.getInputProps('emailOrPhone')}
              styles={{
                input: {
                  borderColor: '#e2e8f0',
                  '&:focus': {
                    borderColor: '#2563eb',
                  },
                },
                label: {
                  color: '#374151',
                  fontWeight: 500,
                },
              }}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              leftSection={<IconLock size={16} />}
              required
              {...form.getInputProps('password')}
              styles={{
                input: {
                  borderColor: '#e2e8f0',
                  '&:focus': {
                    borderColor: '#2563eb',
                  },
                },
                label: {
                  color: '#374151',
                  fontWeight: 500,
                },
              }}
            />

            <Group justify="space-between" align="center">
              <Checkbox
                label="Remember me"
                {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                styles={{
                  label: {
                    color: '#374151',
                    fontSize: '14px',
                  },
                }}
              />
              <Button
                variant="subtle"
                size="sm"
                onClick={handleForgotPassword}
                styles={{
                  root: {
                    color: '#2563eb',
                    '&:hover': {
                      backgroundColor: '#eff6ff',
                    },
                  },
                }}
              >
                Forgot Password?
              </Button>
            </Group>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="md"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                height: rem(48),
                fontSize: '16px',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Stack>
        </form>

        <Divider my="lg" label="or" labelPosition="center" />

        {/* Footer Links */}
        <Stack gap="xs" align="center">
          <Text size="sm" c="dimmed" ta="center">
            Don't have an account?
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegister}
            styles={{
              root: {
                borderColor: '#059669',
                color: '#059669',
                '&:hover': {
                  backgroundColor: '#f0fdf4',
                  borderColor: '#047857',
                },
              },
            }}
          >
            Register as Provider
          </Button>
        </Stack>

        {/* Demo Credentials */}
        <Box mt="xl" p="md" style={{ backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <Text size="xs" c="dimmed" ta="center" mb="xs">
            Demo Credentials:
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            Email: demo@healthcare.com | Password: password123
          </Text>
        </Box>
      </Paper>
    </Container>
  )
} 