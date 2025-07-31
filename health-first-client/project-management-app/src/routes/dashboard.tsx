import { useState, useMemo, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { notifications } from '@mantine/notifications'
import {
  Container, Title, Text, Button, Stack, Paper, Group, Box, Avatar, Badge, ActionIcon, Menu, TextInput, Pagination, Table, rem, Flex, Divider, Grid, Card, Modal, Select, Checkbox, Alert, Tabs, ScrollArea, RingProgress,
} from '@mantine/core'
import {
  IconLogout, IconHeart, IconUser, IconSearch, IconBell, IconMessageCircle, IconDotsVertical, IconPlus, IconEye, IconEdit, IconTrash, IconPhone, IconMail, IconCalendar, IconDashboard, IconUsers, IconFileText, IconSettings, IconClock, IconChevronLeft, IconChevronRight, IconCalendarTime, IconStethoscope, IconCheck, IconX, IconAlertTriangle, IconInfoCircle, IconDownload, IconUpload, IconRefresh, IconFilter, IconCalendarEvent, IconCalendarStats,
} from '@tabler/icons-react'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

interface Patient {
  id: string
  name: string
  dateOfBirth: string
  phone: string
  lastVisit: string
  avatar: string
  avatarColor: string
}

interface TimeSlot {
  id: string
  date: string
  time: string
  status: 'available' | 'booked' | 'blocked' | 'tentative' | 'break'
  duration: number
  appointmentType?: string
  notes?: string
}

interface AvailabilityTemplate {
  id: string
  name: string
  description: string
  timeSlots: string[]
  daysOfWeek: number[]
}

const mockPatients: Patient[] = [
  { id: '#456344', name: 'Heena West', dateOfBirth: '22-07-1940', phone: '(239) 555-0108', lastVisit: '-', avatar: '', avatarColor: '#e5e7eb' },
  { id: '#63454', name: 'Arlene McCoy', dateOfBirth: '18-08-1940', phone: '(316) 555-0116', lastVisit: '-', avatar: '', avatarColor: '#fef3c7' },
  { id: '#379843', name: 'Esther Howard', dateOfBirth: '05-02-1941', phone: '(302) 555-0107', lastVisit: '-', avatar: '', avatarColor: '#dbeafe' },
  { id: '#433475', name: 'Jane Cooper', dateOfBirth: '12-12-1941', phone: '(308) 555-0121', lastVisit: '-', avatar: '', avatarColor: '#f3e8ff' },
  { id: '#540982', name: 'Darrell Steward', dateOfBirth: '01-01-1942', phone: '(219) 555-0114', lastVisit: '-', avatar: '', avatarColor: '#fecaca' },
  { id: '#398475', name: 'Esther Howard', dateOfBirth: '15-05-1940', phone: '(209) 555-0104', lastVisit: '-', avatar: '', avatarColor: '#bbf7d0' },
  { id: '#58293', name: 'Bessie Cooper', dateOfBirth: '30-03-1945', phone: '(303) 555-0105', lastVisit: '-', avatar: '', avatarColor: '#fed7aa' },
  { id: '#67284', name: 'Jackson Smith', dateOfBirth: '27-04-1943', phone: '(202) 555-0199', lastVisit: '-', avatar: '', avatarColor: '#c7d2fe' },
  { id: '#74816', name: 'Ethan Johnson', dateOfBirth: '14-06-1942', phone: '(202) 555-0101', lastVisit: '-', avatar: '', avatarColor: '#fde68a' },
  { id: '#83920', name: 'Liam Brown', dateOfBirth: '03-03-1941', phone: '(202) 555-0123', lastVisit: '-', avatar: '', avatarColor: '#f9a8d4' },
  { id: '#94567', name: 'Noah Davis', dateOfBirth: '21-09-1940', phone: '(202) 555-0145', lastVisit: '-', avatar: '', avatarColor: '#a7f3d0' },
  { id: '#10348', name: 'Mason Wilson', dateOfBirth: '11-10-1944', phone: '(202) 555-0167', lastVisit: '-', avatar: '', avatarColor: '#fbbf24' },
  { id: '#21576', name: 'Lucas Taylor', dateOfBirth: '29-01-1940', phone: '(202) 555-0189', lastVisit: '-', avatar: '', avatarColor: '#f87171' },
  { id: '#32459', name: 'Aiden Anderson', dateOfBirth: '17-07-1945', phone: '(202) 555-0202', lastVisit: '-', avatar: '', avatarColor: '#60a5fa' },
  { id: '#48732', name: 'Carter Thomas', dateOfBirth: '25-12-1941', phone: '(202) 555-0224', lastVisit: '-', avatar: '', avatarColor: '#a78bfa' },
  { id: '#2438', name: 'Leslie Alexander', dateOfBirth: '09-11-1943', phone: '(208) 555-0112', lastVisit: '-', avatar: '', avatarColor: '#34d399' },
]

const timeSlotOptions = [
  '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45',
]

const appointmentTypes = [
  'General Consultation', 'Follow-up', 'Emergency', 'Procedure', 'Lab Work', 'Physical Exam'
]

const durationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
]

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'scheduling'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedView, setSelectedView] = useState<'month' | 'week' | 'day'>('week')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [templates, setTemplates] = useState<AvailabilityTemplate[]>([])
  const navigate = useNavigate()

  // Authentication check
  useEffect(() => {
    const providerToken = localStorage.getItem('providerToken')
    if (!providerToken) {
      navigate({ to: '/login' })
      return
    }

    // Check if token is valid (in a real app, you'd verify with backend)
    // For demo purposes, we'll just check if it exists
    const providerUser = localStorage.getItem('providerUser')
    if (!providerUser) {
      localStorage.removeItem('providerToken')
      navigate({ to: '/login' })
    }
  }, [navigate])

  const handleLogout = () => {
    // Clear provider authentication
    localStorage.removeItem('providerToken')
    localStorage.removeItem('providerUser')
    navigate({ to: '/login' })
  }

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  )

  const itemsPerPage = 11
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPatients = filteredPatients.slice(startIndex, endIndex)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Scheduling functions
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }, [currentDate])

  const weekData = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000))
    }
    return week
  }, [currentDate])

  const getStatusColor = (status: TimeSlot['status']) => {
    switch (status) {
      case 'available': return '#10b981'
      case 'booked': return '#3b82f6'
      case 'blocked': return '#ef4444'
      case 'tentative': return '#f59e0b'
      case 'break': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status: TimeSlot['status']) => {
    switch (status) {
      case 'available': return 'Available'
      case 'booked': return 'Booked'
      case 'blocked': return 'Blocked'
      case 'tentative': return 'Tentative'
      case 'break': return 'Break'
      default: return 'Unknown'
    }
  }

  const handleAddAvailability = () => {
    setAddModalOpen(true)
  }

  const handleEditSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setEditModalOpen(true)
  }

  const handleDeleteSlot = (slotId: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== slotId))
    notifications.show({
      title: 'Time Slot Deleted',
      message: 'The time slot has been successfully deleted.',
      color: 'green',
    })
  }

  const handleBulkAction = (action: string) => {
    // Handle bulk actions
    notifications.show({
      title: 'Bulk Action',
      message: `${action} applied to ${selectedSlots.length} slots.`,
      color: 'blue',
    })
    setSelectedSlots([])
  }

  const getSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return timeSlots.filter(slot => slot.date === dateStr)
  }

  const getDayStats = (date: Date) => {
    const slots = getSlotsForDate(date)
    const total = slots.length
    const available = slots.filter(s => s.status === 'available').length
    const booked = slots.filter(s => s.status === 'booked').length
    return { total, available, booked }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (selectedView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (selectedView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const renderSchedulingContent = () => (
    <Stack gap="lg">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group>
          <IconCalendar size={24} color="#3b82f6" />
          <Title order={2} size="h3">
            Provider Availability Management
          </Title>
        </Group>
        <Group>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={handleAddAvailability}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
            }}
          >
            Add Availability
          </Button>
        </Group>
      </Group>

      <Grid gutter="lg">
        {/* Sidebar */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Paper shadow="sm" p="md" radius="md">
            <Stack gap="md">
              <Title order={3} size="h5">Quick Stats</Title>
              
              <Card p="sm" radius="md" style={{ backgroundColor: '#f0f9ff' }}>
                <Group gap="sm">
                  <IconCalendar size={20} color="#3b82f6" />
                  <div>
                    <Text size="lg" fw={600}>{timeSlots.length}</Text>
                    <Text size="sm" c="dimmed">Total Slots</Text>
                  </div>
                </Group>
              </Card>

              <Card p="sm" radius="md" style={{ backgroundColor: '#f0fdf4' }}>
                <Group gap="sm">
                  <IconCheck size={20} color="#10b981" />
                  <div>
                    <Text size="lg" fw={600}>
                      {timeSlots.filter(s => s.status === 'available').length}
                    </Text>
                    <Text size="sm" c="dimmed">Available</Text>
                  </div>
                </Group>
              </Card>

              <Card p="sm" radius="md" style={{ backgroundColor: '#fef3c7' }}>
                <Group gap="sm">
                  <IconCalendarEvent size={20} color="#f59e0b" />
                  <div>
                    <Text size="lg" fw={600}>
                      {timeSlots.filter(s => s.status === 'booked').length}
                    </Text>
                    <Text size="sm" c="dimmed">Booked</Text>
                  </div>
                </Group>
              </Card>

              <Divider />

              <Title order={4} size="h6">View Options</Title>
              <Select
                value={selectedView}
                onChange={(value) => setSelectedView(value as 'month' | 'week' | 'day')}
                data={[
                  { value: 'month', label: 'Month View' },
                  { value: 'week', label: 'Week View' },
                  { value: 'day', label: 'Day View' },
                ]}
                size="sm"
              />

              <Checkbox
                label="Bulk Edit Mode"
                checked={bulkEditMode}
                onChange={(event) => setBulkEditMode(event.currentTarget.checked)}
              />

              {bulkEditMode && selectedSlots.length > 0 && (
                <Alert icon={<IconAlertTriangle size={16} />} color="blue">
                  <Text size="sm">
                    {selectedSlots.length} slots selected
                  </Text>
                  <Group gap="xs" mt="xs">
                    <Button size="xs" variant="light">Delete</Button>
                    <Button size="xs" variant="light">Block</Button>
                  </Group>
                </Alert>
              )}

              <Divider />

              <Title order={4} size="h6">Quick Actions</Title>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconDownload size={16} />}
                fullWidth
              >
                Export Schedule
              </Button>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconUpload size={16} />}
                fullWidth
              >
                Import Schedule
              </Button>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconRefresh size={16} />}
                fullWidth
              >
                Refresh Data
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Main Calendar Area */}
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Paper shadow="sm" p="xl" radius="md">
            {/* Calendar Header */}
            <Group justify="space-between" align="center" mb="lg">
              <Group>
                <ActionIcon
                  variant="light"
                  size="lg"
                  onClick={() => navigateDate('prev')}
                >
                  <IconChevronLeft size={20} />
                </ActionIcon>
                <Title order={2} size="h3">
                  {selectedView === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  {selectedView === 'week' && `Week of ${weekData[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  {selectedView === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </Title>
                <ActionIcon
                  variant="light"
                  size="lg"
                  onClick={() => navigateDate('next')}
                >
                  <IconChevronRight size={20} />
                </ActionIcon>
              </Group>
              <Group>
                <Button
                  variant="light"
                  leftSection={<IconCalendarTime size={16} />}
                  onClick={goToToday}
                >
                  Today
                </Button>
              </Group>
            </Group>

            {/* Calendar Content */}
            {selectedView === 'month' && (
              <div>
                {/* Month Grid */}
                <Grid gutter={0}>
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Grid.Col span={1} key={day}>
                      <Box p="xs" style={{ textAlign: 'center', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                        <Text size="sm">{day}</Text>
                      </Box>
                    </Grid.Col>
                  ))}
                  
                  {/* Calendar days */}
                  {calendarData.map((date, index) => {
                    const dayStats = getDayStats(date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                    
                    return (
                      <Grid.Col span={1} key={index}>
                        <Box
                          p="xs"
                          style={{
                            minHeight: '80px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: isToday ? '#eff6ff' : 'white',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setCurrentDate(date)
                            setSelectedView('day')
                          }}
                        >
                          <Text 
                            size="sm" 
                            fw={isToday ? 600 : 400}
                            c={isCurrentMonth ? 'inherit' : 'dimmed'}
                          >
                            {date.getDate()}
                          </Text>
                          {dayStats.total > 0 && (
                            <Stack gap={2} mt={4}>
                              <Badge size="xs" color="green" variant="light">
                                {dayStats.available}
                              </Badge>
                              {dayStats.booked > 0 && (
                                <Badge size="xs" color="blue" variant="light">
                                  {dayStats.booked}
                                </Badge>
                              )}
                            </Stack>
                          )}
                        </Box>
                      </Grid.Col>
                    )
                  })}
                </Grid>
              </div>
            )}

            {selectedView === 'week' && (
              <div>
                {/* Week Grid */}
                <Grid gutter={0}>
                  <Grid.Col span={2}>
                    <Box p="xs" style={{ textAlign: 'center', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                      Time
                    </Box>
                  </Grid.Col>
                  {weekData.map((date, index) => (
                    <Grid.Col span={1} key={index}>
                      <Box p="xs" style={{ textAlign: 'center', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                        <Text size="sm">{date.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                        <Text size="xs" c="dimmed">{date.getDate()}</Text>
                      </Box>
                    </Grid.Col>
                  ))}
                  
                  {timeSlotOptions.map((time, timeIndex) => (
                    <>
                      <Grid.Col span={2} key={`time-${timeIndex}`}>
                        <Box p="xs" style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                          <Text size="xs">{time}</Text>
                        </Box>
                      </Grid.Col>
                      {weekData.map((date, dateIndex) => {
                        const dateStr = date.toISOString().split('T')[0]
                        const slot = timeSlots.find(s => s.date === dateStr && s.time === time)
                        
                        return (
                          <Grid.Col span={1} key={`${dateIndex}-${timeIndex}`}>
                            <Box
                              p="xs"
                              style={{
                                textAlign: 'center',
                                borderBottom: '1px solid #e2e8f0',
                                borderRight: '1px solid #e2e8f0',
                                backgroundColor: slot ? getStatusColor(slot.status) : 'transparent',
                                color: slot ? 'white' : 'inherit',
                                cursor: 'pointer',
                                minHeight: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              onClick={() => {
                                if (slot) {
                                  handleEditSlot(slot)
                                } else {
                                  // Add new slot
                                  const newSlot: TimeSlot = {
                                    id: `${dateStr}-${time}`,
                                    date: dateStr,
                                    time,
                                    status: 'available',
                                    duration: 30,
                                  }
                                  setTimeSlots(prev => [...prev, newSlot])
                                }
                              }}
                            >
                              {slot ? (
                                <Text size="xs" fw={500}>
                                  {slot.appointmentType || getStatusLabel(slot.status)}
                                </Text>
                              ) : (
                                <Text size="xs" c="dimmed">+</Text>
                              )}
                            </Box>
                          </Grid.Col>
                        )
                      })}
                    </>
                  ))}
                </Grid>
              </div>
            )}

            {selectedView === 'day' && (
              <div>
                {/* Day View */}
                <Grid gutter={0}>
                  <Grid.Col span={2}>
                    <Box p="xs" style={{ textAlign: 'center', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                      Time
                    </Box>
                  </Grid.Col>
                  <Grid.Col span={10}>
                    <Box p="xs" style={{ textAlign: 'center', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                      {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </Box>
                  </Grid.Col>
                  
                  {timeSlotOptions.map((time, timeIndex) => {
                    const dateStr = currentDate.toISOString().split('T')[0]
                    const slot = timeSlots.find(s => s.date === dateStr && s.time === time)
                    
                    return (
                      <>
                        <Grid.Col span={2} key={`time-${timeIndex}`}>
                          <Box p="xs" style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                            <Text size="sm">{time}</Text>
                          </Box>
                        </Grid.Col>
                        <Grid.Col span={10} key={`slot-${timeIndex}`}>
                          <Box
                            p="md"
                            style={{
                              borderBottom: '1px solid #e2e8f0',
                              backgroundColor: slot ? getStatusColor(slot.status) : 'transparent',
                              color: slot ? 'white' : 'inherit',
                              cursor: 'pointer',
                              minHeight: '60px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                            onClick={() => {
                              if (slot) {
                                handleEditSlot(slot)
                              } else {
                                // Add new slot
                                const newSlot: TimeSlot = {
                                  id: `${dateStr}-${time}`,
                                  date: dateStr,
                                  time,
                                  status: 'available',
                                  duration: 30,
                                }
                                setTimeSlots(prev => [...prev, newSlot])
                              }
                            }}
                          >
                            {slot ? (
                              <>
                                <div>
                                  <Text size="sm" fw={500}>
                                    {slot.appointmentType || getStatusLabel(slot.status)}
                                  </Text>
                                  {slot.notes && (
                                    <Text size="xs" c="dimmed">
                                      {slot.notes}
                                    </Text>
                                  )}
                                </div>
                                <Badge color={slot.status === 'available' ? 'green' : 'blue'} variant="light">
                                  {slot.duration}min
                                </Badge>
                              </>
                            ) : (
                              <Text size="sm" c="dimmed">Click to add availability</Text>
                            )}
                          </Box>
                        </Grid.Col>
                      </>
                    )
                  })}
                </Grid>
              </div>
            )}
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Add Availability Modal */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Availability"
        size="lg"
      >
        <Stack gap="lg">
          <Text size="sm" c="dimmed">
            Add new availability slots for your schedule. You can set up recurring schedules or add individual slots.
          </Text>
          
          <Tabs defaultValue="single">
            <Tabs.List>
              <Tabs.Tab value="single" leftSection={<IconCalendar size={16} />}>
                Single Slot
              </Tabs.Tab>
              <Tabs.Tab value="recurring" leftSection={<IconCalendarStats size={16} />}>
                Recurring Schedule
              </Tabs.Tab>
              <Tabs.Tab value="batch" leftSection={<IconPlus size={16} />}>
                Batch Add
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="single" pt="md">
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Date"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Time"
                      placeholder="Select time"
                      data={timeSlotOptions}
                    />
                  </Grid.Col>
                </Grid>
                
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Duration"
                      placeholder="Select duration"
                      data={durationOptions}
                      defaultValue="30"
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Appointment Type"
                      placeholder="Select type"
                      data={appointmentTypes}
                    />
                  </Grid.Col>
                </Grid>
                
                <TextInput
                  label="Notes"
                  placeholder="Optional notes..."
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="recurring" pt="md">
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Start Date"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="End Date"
                      type="date"
                      defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </Grid.Col>
                </Grid>
                
                <Select
                  label="Days of Week"
                  placeholder="Select days"
                  data={[
                    { value: '1', label: 'Monday' },
                    { value: '2', label: 'Tuesday' },
                    { value: '3', label: 'Wednesday' },
                    { value: '4', label: 'Thursday' },
                    { value: '5', label: 'Friday' },
                    { value: '6', label: 'Saturday' },
                    { value: '0', label: 'Sunday' },
                  ]}
                  multiple
                />
                
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Start Time"
                      placeholder="Select time"
                      data={timeSlotOptions}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="End Time"
                      placeholder="Select time"
                      data={timeSlotOptions}
                    />
                  </Grid.Col>
                </Grid>
                
                <Select
                  label="Duration"
                  placeholder="Select duration"
                  data={durationOptions}
                  defaultValue="30"
                />
                
                <Select
                  label="Appointment Type"
                  placeholder="Select type"
                  data={appointmentTypes}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="batch" pt="md">
              <Stack gap="md">
                <Alert icon={<IconInfoCircle size={16} />} color="blue">
                  <Text size="sm">
                    Batch add allows you to quickly add multiple time slots across different dates and times.
                  </Text>
                </Alert>
                
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Start Date"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="End Date"
                      type="date"
                      defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </Grid.Col>
                </Grid>
                
                <Select
                  label="Time Range"
                  placeholder="Select time slots"
                  data={timeSlotOptions}
                  multiple
                />
                
                <Select
                  label="Duration"
                  placeholder="Select duration"
                  data={durationOptions}
                  defaultValue="30"
                />
                
                <Select
                  label="Appointment Type"
                  placeholder="Select type"
                  data={appointmentTypes}
                />
              </Stack>
            </Tabs.Panel>
          </Tabs>
          
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddModalOpen(false)
                notifications.show({
                  title: 'Availability Added',
                  message: 'New availability slots have been added successfully.',
                  color: 'green',
                })
              }}
            >
              Add Slots
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Time Slot"
        size="md"
      >
        {selectedSlot && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Edit details for the selected time slot.
            </Text>
            
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Date"
                  value={selectedSlot.date}
                  type="date"
                  readOnly
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Time"
                  value={selectedSlot.time}
                  readOnly
                />
              </Grid.Col>
            </Grid>
            
            <Select
              label="Status"
              value={selectedSlot.status}
              data={[
                { value: 'available', label: 'Available' },
                { value: 'booked', label: 'Booked' },
                { value: 'blocked', label: 'Blocked' },
                { value: 'tentative', label: 'Tentative' },
                { value: 'break', label: 'Break' },
              ]}
            />
            
            <Select
              label="Appointment Type"
              value={selectedSlot.appointmentType}
              data={appointmentTypes}
            />
            
            <Select
              label="Duration"
              value={selectedSlot.duration.toString()}
              data={durationOptions}
            />
            
            <TextInput
              label="Notes"
              value={selectedSlot.notes || ''}
              placeholder="Add notes..."
            />
            
            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                color="red"
                onClick={() => {
                  handleDeleteSlot(selectedSlot.id)
                  setEditModalOpen(false)
                }}
              >
                Delete
              </Button>
              <Button variant="subtle" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setEditModalOpen(false)
                  notifications.show({
                    title: 'Slot Updated',
                    message: 'Time slot has been updated successfully.',
                    color: 'green',
                  })
                }}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  )

  const renderDashboardContent = () => (
    <Stack gap="lg">
      <Text size="lg" c="dimmed">
        Welcome to your healthcare application dashboard! This is where you can manage your patients,
        appointments, and medical records.
      </Text>

      {/* Quick Stats */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" p="md" radius="md">
            <Group gap="sm">
              <IconUsers size={24} color="#3b82f6" />
              <div>
                <Text size="lg" fw={600}>24</Text>
                <Text size="sm" c="dimmed">Active Patients</Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" p="md" radius="md">
            <Group gap="sm">
              <IconCalendar size={24} color="#10b981" />
              <div>
                <Text size="lg" fw={600}>18</Text>
                <Text size="sm" c="dimmed">Today's Appointments</Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" p="md" radius="md">
            <Group gap="sm">
              <IconFileText size={24} color="#f59e0b" />
              <div>
                <Text size="lg" fw={600}>156</Text>
                <Text size="sm" c="dimmed">Pending Reports</Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" p="md" radius="md">
            <Group gap="sm">
              <IconSettings size={24} color="#8b5cf6" />
              <div>
                <Text size="lg" fw={600}>85%</Text>
                <Text size="sm" c="dimmed">Schedule Utilization</Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Quick Actions */}
      <Paper shadow="sm" p="md" radius="md" style={{ backgroundColor: '#f8fafc' }}>
        <Title order={3} size="h4" mb="md">Quick Actions</Title>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Button
              variant="light"
              size="lg"
              leftSection={<IconCalendar size={20} />}
              fullWidth
              onClick={() => setActiveTab('scheduling')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
              }}
            >
              Manage Availability
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Button
              variant="light"
              size="lg"
              leftSection={<IconPlus size={20} />}
              fullWidth
              onClick={() => setActiveTab('patients')}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
              }}
            >
              Add Patient
            </Button>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Button
              variant="light"
              size="lg"
              leftSection={<IconFileText size={20} />}
              fullWidth
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
              }}
            >
              View Reports
            </Button>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Recent Activity */}
      <Paper shadow="sm" p="md" radius="md">
        <Title order={3} size="h4" mb="md">Recent Activity</Title>
        <Stack gap="sm">
          <Group justify="space-between" p="sm" style={{ backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <Group gap="sm">
              <IconCalendar size={16} color="#3b82f6" />
              <div>
                <Text size="sm" fw={500}>Appointment Scheduled</Text>
                <Text size="xs" c="dimmed">Patient: John Doe - 2:30 PM Today</Text>
              </div>
            </Group>
            <Badge color="blue" variant="light">New</Badge>
          </Group>
          <Group justify="space-between" p="sm" style={{ backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <Group gap="sm">
              <IconFileText size={16} color="#10b981" />
              <div>
                <Text size="sm" fw={500}>Report Completed</Text>
                <Text size="xs" c="dimmed">Lab Results - Patient: Sarah Smith</Text>
              </div>
            </Group>
            <Badge color="green" variant="light">Completed</Badge>
          </Group>
          <Group justify="space-between" p="sm" style={{ backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <Group gap="sm">
              <IconUsers size={16} color="#f59e0b" />
              <div>
                <Text size="sm" fw={500}>New Patient Registration</Text>
                <Text size="xs" c="dimmed">Patient: Michael Johnson</Text>
              </div>
            </Group>
            <Badge color="yellow" variant="light">Pending</Badge>
          </Group>
        </Stack>
      </Paper>

      <Text size="sm" c="dimmed">
        This is a demo dashboard. In a real application, you would see patient lists,
        appointment schedules, medical records, and other healthcare management features.
      </Text>
    </Stack>
  )

  const renderPatientsContent = () => (
    <Stack gap="lg">
      {/* Header with Search */}
      <Group justify="space-between" align="center">
        <Group gap="md">
          <TextInput
            placeholder="Search by patient name, DOB"
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ width: 250 }}
            styles={{
              input: {
                backgroundColor: 'white',
                border: 'none',
                boxShadow: '0px 0px 8px 0px rgba(0, 0, 0, 0.16)',
                borderRadius: 4,
              }
            }}
          />
        </Group>

        <Group gap="md">
          <Button
            leftSection={<IconPlus size={16} />}
            style={{
              backgroundColor: '#233853',
              color: 'white',
              borderRadius: 4,
            }}
          >
            New Patient
          </Button>
        </Group>
      </Group>

      {/* Patient List Table */}
      <Paper 
        shadow="sm" 
        p="lg" 
        radius="md"
        style={{ 
          backgroundColor: 'white',
          boxShadow: '1px 1px 8px 0px rgba(0, 0, 0, 0.25)'
        }}
      >
        <Stack gap="md">
          {/* Table Header */}
          <Group justify="space-between" align="center">
            <Title order={2} size="h5" c="#2E2E2E" style={{ fontWeight: 500 }}>
              Patients List
            </Title>
          </Group>

          {/* Table */}
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#E7E7E7' }}>
                <Table.Th style={{ color: '#565656', fontWeight: 500, padding: '12px' }}>Patient ID</Table.Th>
                <Table.Th style={{ color: '#565656', fontWeight: 500, padding: '8px' }}>Name</Table.Th>
                <Table.Th style={{ color: '#565656', fontWeight: 500, padding: '12px' }}>Date of Birth</Table.Th>
                <Table.Th style={{ color: '#565656', fontWeight: 500, padding: '12px' }}>Contact Details</Table.Th>
                <Table.Th style={{ color: '#565656', fontWeight: 500, padding: '12px' }}>Last Visit</Table.Th>
                <Table.Th style={{ color: '#565656', fontWeight: 500, padding: '12px', textAlign: 'center' }}>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {currentPatients.map((patient) => (
                <Table.Tr key={patient.id} style={{ borderBottom: '1px solid #D8D8D8' }}>
                  <Table.Td style={{ color: '#727272', padding: '18px' }}>
                    {patient.id}
                  </Table.Td>
                  <Table.Td style={{ padding: '8px' }}>
                    <Group gap="sm">
                      <Avatar 
                        size="sm" 
                        color="gray"
                        style={{ backgroundColor: patient.avatarColor }}
                      >
                        {getInitials(patient.name)}
                      </Avatar>
                      <Text style={{ color: '#233853', fontWeight: 500 }}>
                        {patient.name}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td style={{ color: '#727272', padding: '12px' }}>
                    {patient.dateOfBirth}
                  </Table.Td>
                  <Table.Td style={{ color: '#727272', padding: '12px' }}>
                    {patient.phone}
                  </Table.Td>
                  <Table.Td style={{ color: '#727272', padding: '12px' }}>
                    {patient.lastVisit}
                  </Table.Td>
                  <Table.Td style={{ padding: '18px', textAlign: 'center' }}>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" size="sm">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14} />}>
                          View Details
                        </Menu.Item>
                        <Menu.Item leftSection={<IconEdit size={14} />}>
                          Edit Patient
                        </Menu.Item>
                        <Menu.Item leftSection={<IconPhone size={14} />}>
                          Call Patient
                        </Menu.Item>
                        <Menu.Item leftSection={<IconMail size={14} />}>
                          Send Message
                        </Menu.Item>
                        <Menu.Item leftSection={<IconCalendar size={14} />}>
                          Schedule Appointment
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                          Delete Patient
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {/* Pagination */}
          <Group justify="space-between" align="center" pt="md">
            <Text size="sm" c="#464646">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length} results
            </Text>
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              size="sm"
              radius="sm"
              styles={{
                control: {
                  border: 'none',
                  backgroundColor: 'white',
                  boxShadow: '0px 0px 6px 0px rgba(86, 86, 86, 0.25)',
                },
                controlActive: {
                  backgroundColor: '#233853',
                  color: 'white',
                }
              }}
            />
          </Group>
        </Stack>
      </Paper>
    </Stack>
  )

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#F3F3F3' }}>
      {/* Navigation Bar */}
      <Paper 
        shadow="sm" 
        style={{ 
          backgroundColor: '#233853', 
          borderRadius: '0px 0px 4px 4px',
          border: 'none'
        }}
      >
        <Container size="xl" py="xs">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Title order={1} size="h4" c="white" style={{ fontWeight: 500 }}>
                Sample EMR
              </Title>
            </Group>

            <Group gap="md">
              {/* Navigation Menu */}
              <Group gap="xs">
                <Button 
                  variant={activeTab === 'dashboard' ? 'filled' : 'subtle'}
                  color="white" 
                  size="sm"
                  onClick={() => setActiveTab('dashboard')}
                  style={{ 
                    backgroundColor: activeTab === 'dashboard' ? 'white' : 'transparent', 
                    color: activeTab === 'dashboard' ? '#233853' : 'white',
                    position: 'relative'
                  }}
                >
                  Dashboard
                  {activeTab === 'dashboard' && (
                    <Box 
                      style={{
                        position: 'absolute',
                        bottom: -12,
                        left: 0,
                        right: 0,
                        height: 3,
                        backgroundColor: 'white',
                        borderRadius: '2px 2px 0px 0px'
                      }}
                    />
                  )}
                </Button>
                <Button 
                  variant={activeTab === 'patients' ? 'filled' : 'subtle'}
                  color="white" 
                  size="sm"
                  onClick={() => setActiveTab('patients')}
                  style={{ 
                    backgroundColor: activeTab === 'patients' ? 'white' : 'transparent', 
                    color: activeTab === 'patients' ? '#233853' : 'white',
                    position: 'relative'
                  }}
                >
                  Patients
                  {activeTab === 'patients' && (
                    <Box 
                      style={{
                        position: 'absolute',
                        bottom: -12,
                        left: 0,
                        right: 0,
                        height: 3,
                        backgroundColor: 'white',
                        borderRadius: '2px 2px 0px 0px'
                      }}
                    />
                  )}
                </Button>
                <Button 
                  variant={activeTab === 'scheduling' ? 'filled' : 'subtle'}
                  color="white" 
                  size="sm"
                  onClick={() => setActiveTab('scheduling')}
                  style={{ 
                    backgroundColor: activeTab === 'scheduling' ? 'white' : 'transparent', 
                    color: activeTab === 'scheduling' ? '#233853' : 'white',
                    position: 'relative'
                  }}
                >
                  Scheduling
                  {activeTab === 'scheduling' && (
                    <Box 
                      style={{
                        position: 'absolute',
                        bottom: -12,
                        left: 0,
                        right: 0,
                        height: 3,
                        backgroundColor: 'white',
                        borderRadius: '2px 2px 0px 0px'
                      }}
                    />
                  )}
                </Button>
                <Button variant="subtle" color="white" size="sm">Communications</Button>
                <Button variant="subtle" color="white" size="sm">Billing</Button>
                <Button variant="subtle" color="white" size="sm">Referral</Button>
                <Button variant="subtle" color="white" size="sm">Reports</Button>
                <Button variant="subtle" color="white" size="sm">Settings</Button>
              </Group>

              <Divider orientation="vertical" color="rgba(255,255,255,0.3)" />

              {/* Right side icons */}
              <Group gap="xs">
                <ActionIcon variant="subtle" color="white" size="sm">
                  <IconSearch size={16} />
                </ActionIcon>
                <Divider orientation="vertical" color="rgba(255,255,255,0.3)" />
                <ActionIcon variant="subtle" color="white" size="sm">
                  <IconMessageCircle size={16} />
                  <Badge 
                    size="xs" 
                    color="red" 
                    style={{ 
                      position: 'absolute', 
                      top: -2, 
                      right: -2,
                      minWidth: 12,
                      height: 12,
                      fontSize: 8
                    }}
                  >
                    3
                  </Badge>
                </ActionIcon>
                <Divider orientation="vertical" color="rgba(255,255,255,0.3)" />
                <ActionIcon variant="subtle" color="white" size="sm">
                  <IconBell size={16} />
                </ActionIcon>
                <Divider orientation="vertical" color="rgba(255,255,255,0.3)" />
                <Group gap="xs">
                  <Avatar 
                    size="sm" 
                    color="blue"
                    style={{ border: '1px solid white' }}
                  >
                    JD
                  </Avatar>
                  <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                      <Button
                        variant="subtle"
                        color="white"
                        size="sm"
                        style={{
                          padding: '4px 8px',
                          height: 'auto',
                          minHeight: 'unset',
                        }}
                      >
                        <Text size="sm" c="white" style={{ fontWeight: 500 }}>
                          Dr. John Doe
                        </Text>
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconUser size={14} />}>
                        Profile
                      </Menu.Item>
                      <Menu.Item leftSection={<IconSettings size={14} />}>
                        Settings
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item 
                        leftSection={<IconLogout size={14} />} 
                        color="red"
                        onClick={handleLogout}
                      >
                        Logout
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>
            </Group>
          </Group>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container size="xl" py="xl">
        {activeTab === 'dashboard' && renderDashboardContent()}
        {activeTab === 'patients' && renderPatientsContent()}
        {activeTab === 'scheduling' && renderSchedulingContent()}
      </Container>
    </Box>
  )
} 