import { useState } from 'react'
import { useForm } from '@mantine/form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { notifications } from '@mantine/notifications'
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Group,
  Stack,
  Divider,
  Box,
  Center,
  Flex,
  rem,
  Alert,
} from '@mantine/core'
import {
  IconUser,
  IconLock,
  IconEye,
  IconEyeOff,
  IconHeart,
  IconMail,
  IconPhone,
  IconInfoCircle,
  IconShield,
  IconArrowRight,
  IconCheck,
  IconX,
} from '@tabler/icons-react'

export const Route = createFileRoute('/patient-login')({
  component: PatientLogin,
})

interface PatientLoginForm {
  emailOrPhone: string
  password: string
  rememberMe: boolean
}

function PatientLogin() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const form = useForm<PatientLoginForm>({
    initialValues: {
      emailOrPhone: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      emailOrPhone: (value) => {
        if (!value) return 'Please enter your email or phone number'
        
        // Check if it's an email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(value)) return null
        
        // Check if it's a phone number (basic validation)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        if (phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) return null
        
        return 'Please enter a valid email or phone number'
      },
      password: (value) => {
        if (!value) return 'Please enter your password'
        if (value.length < 6) return 'Password must be at least 6 characters'
        return null
      },
    },
  })

  const handleSubmit = async (values: PatientLoginForm) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate successful login
      if (values.emailOrPhone === 'patient@healthcare.com' && values.password === 'patient123') {
        notifications.show({
          title: 'Welcome Back! 👋',
          message: 'Successfully logged in. Taking you to your health dashboard...',
          color: 'green',
          icon: <IconCheck size={16} />,
        })
        
        // Redirect to patient dashboard after a brief delay
        setTimeout(() => {
          navigate({ to: '/patient-dashboard' })
        }, 1000)
      } else {
        notifications.show({
          title: 'Login Unsuccessful',
          message: 'Please check your email/phone and password. Need help? Contact support.',
          color: 'red',
          icon: <IconX size={16} />,
        })
      }
    } catch (error) {
      notifications.show({
        title: 'Connection Issue',
        message: 'Unable to connect. Please check your internet and try again.',
        color: 'orange',
        icon: <IconInfoCircle size={16} />,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    notifications.show({
      title: 'Password Recovery',
      message: 'We\'ll send you a secure link to reset your password.',
      color: 'blue',
      icon: <IconMail size={16} />,
    })
  }

  const handleRegister = () => {
    navigate({ to: '/patient-register' })
  }

  const handleProviderLogin = () => {
    navigate({ to: '/login' })
  }

  return (
    <Container size="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper
        shadow="sm"
        p="xl"
        radius="lg"
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Header */}
        <Center mb="xl">
          <Stack align="center" gap="xs">
            <Box
              style={{
                width: rem(70),
                height: rem(70),
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: rem(12),
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <IconHeart size={36} color="white" />
            </Box>
            <Title order={1} size="h2" ta="center" c="#1e293b" style={{ fontWeight: 600 }}>
              Welcome Back
            </Title>
            <Text c="dimmed" size="lg" ta="center" style={{ fontWeight: 400 }}>
              Access your health information safely and securely
            </Text>
          </Stack>
        </Center>

        {/* Security Notice */}
        <Alert
          icon={<IconShield size={16} />}
          title="Your Privacy Matters"
          color="blue"
          variant="light"
          mb="lg"
          style={{ borderRadius: '8px' }}
        >
          <Text size="sm">
            Your health information is protected with bank-level security. We never share your data without your permission.
          </Text>
        </Alert>

        {/* Login Form */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <TextInput
              label="Email or Phone Number"
              placeholder="Enter your email or phone number"
              leftSection={<IconUser size={18} />}
              required
              size="lg"
              {...form.getInputProps('emailOrPhone')}
              styles={{
                input: {
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  height: rem(56),
                  '&:focus': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  },
                },
                label: {
                  color: '#374151',
                  fontWeight: 500,
                  fontSize: '14px',
                  marginBottom: rem(8),
                },
                leftSection: {
                  color: '#6b7280',
                },
              }}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              leftSection={<IconLock size={18} />}
              rightSection={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '8px',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                    },
                  }}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              }
              required
              size="lg"
              {...form.getInputProps('password')}
              styles={{
                input: {
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  height: rem(56),
                  '&:focus': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  },
                },
                label: {
                  color: '#374151',
                  fontWeight: 500,
                  fontSize: '14px',
                  marginBottom: rem(8),
                },
                leftSection: {
                  color: '#6b7280',
                },
                rightSection: {
                  color: '#6b7280',
                },
              }}
            />

            <Group justify="space-between" align="center">
              <Checkbox
                label="Keep me signed in"
                {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                styles={{
                  label: {
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 400,
                  },
                  input: {
                    '&:checked': {
                      backgroundColor: '#3b82f6',
                      borderColor: '#3b82f6',
                    },
                  },
                }}
              />
              <Button
                variant="subtle"
                size="sm"
                onClick={handleForgotPassword}
                styles={{
                  root: {
                    color: '#3b82f6',
                    fontWeight: 500,
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
              size="lg"
              rightSection={!loading && <IconArrowRight size={18} />}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                height: rem(56),
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                },
              }}
            >
              {loading ? 'Signing In...' : 'Sign In to My Health'}
            </Button>
          </Stack>
        </form>

        <Divider my="xl" label="or" labelPosition="center" />

        {/* Support Links */}
        <Stack gap="md" align="center">
          <Text size="sm" c="dimmed" ta="center">
            New to our platform?
          </Text>
          <Button
            variant="outline"
            size="md"
            onClick={handleRegister}
            styles={{
              root: {
                borderColor: '#10b981',
                color: '#10b981',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#f0fdf4',
                  borderColor: '#059669',
                },
              },
            }}
          >
            Create Patient Account
          </Button>
          
          <Button
            variant="subtle"
            size="sm"
            onClick={handleProviderLogin}
            styles={{
              root: {
                color: '#6b7280',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                },
              },
            }}
          >
            I'm a Healthcare Provider
          </Button>
        </Stack>

        {/* Demo Credentials */}
        <Box mt="xl" p="md" style={{ 
          backgroundColor: '#f0f9ff', 
          borderRadius: '12px',
          border: '1px solid #bae6fd'
        }}>
          <Text size="xs" c="#0369a1" ta="center" mb="xs" style={{ fontWeight: 500 }}>
            Demo Patient Account:
          </Text>
          <Text size="xs" c="#0369a1" ta="center">
            Email: patient@healthcare.com | Password: patient123
          </Text>
        </Box>

        {/* Help & Support */}
        <Box mt="lg" ta="center">
          <Text size="xs" c="dimmed" mb="xs">
            Need help? Contact our support team
          </Text>
          <Group justify="center" gap="xs">
            <Button variant="subtle" size="xs" style={{ color: '#6b7280' }}>
              Help Center
            </Button>
            <Text size="xs" c="dimmed">•</Text>
            <Button variant="subtle" size="xs" style={{ color: '#6b7280' }}>
              Contact Support
            </Button>
            <Text size="xs" c="dimmed">•</Text>
            <Button variant="subtle" size="xs" style={{ color: '#6b7280' }}>
              Privacy Policy
            </Button>
          </Group>
        </Box>
      </Paper>
    </Container>
  )
} 