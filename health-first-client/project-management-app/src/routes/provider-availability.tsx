import { useState, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { notifications } from '@mantine/notifications'
import {
  Container, Paper, Title, Text, Button, Group, Stack, Divider, Box, Center, Grid, Modal, rem, Alert, Select, TextInput, Checkbox, Badge, Card, ActionIcon, Menu, Tooltip, Switch, Tabs, ScrollArea, Flex, RingProgress,
} from '@mantine/core'
import {
  IconCalendar, IconClock, IconPlus, IconEdit, IconTrash, IconCopy, IconSettings, IconChevronLeft, IconChevronRight, IconCalendarTime, IconStethoscope, IconUser, IconCheck, IconX, IconAlertTriangle, IconInfoCircle, IconDownload, IconUpload, IconRefresh, IconEye, IconEyeOff, IconFilter, IconSearch, IconDotsVertical, IconCalendarEvent, IconCalendarStats,
} from '@tabler/icons-react'

export const Route = createFileRoute('/provider-availability')({
  component: ProviderAvailability,
})

interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  duration: number
  status: 'available' | 'booked' | 'blocked' | 'tentative' | 'break'
  appointmentType?: string
  notes?: string
  isRecurring?: boolean
  recurringPattern?: string
}

interface AvailabilityTemplate {
  id: string
  name: string
  description: string
  slots: Omit<TimeSlot, 'id' | 'date'>[]
}

const appointmentTypes = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'screening', label: 'Screening' },
]

const durationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
]

const timeSlotOptions = [
  '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
  '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45',
  '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45',
]

function ProviderAvailability() {
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

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }, [currentDate])

  // Get week data
  const weekData = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(day.getDate() + i)
      days.push(day)
    }
    
    return days
  }, [currentDate])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981'
      case 'booked': return '#3b82f6'
      case 'blocked': return '#ef4444'
      case 'tentative': return '#f59e0b'
      case 'break': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status: string) => {
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
      title: 'Slot Deleted',
      message: 'Time slot has been removed from your schedule.',
      color: 'green',
      icon: <IconCheck size={16} />,
    })
  }

  const handleBulkAction = (action: string) => {
    if (selectedSlots.length === 0) {
      notifications.show({
        title: 'No Slots Selected',
        message: 'Please select time slots to perform bulk actions.',
        color: 'orange',
        icon: <IconAlertTriangle size={16} />,
      })
      return
    }

    switch (action) {
      case 'delete':
        setTimeSlots(prev => prev.filter(slot => !selectedSlots.includes(slot.id)))
        setSelectedSlots([])
        notifications.show({
          title: 'Bulk Delete Complete',
          message: `${selectedSlots.length} time slots have been deleted.`,
          color: 'green',
          icon: <IconCheck size={16} />,
        })
        break
      case 'block':
        setTimeSlots(prev => prev.map(slot => 
          selectedSlots.includes(slot.id) ? { ...slot, status: 'blocked' } : slot
        ))
        setSelectedSlots([])
        notifications.show({
          title: 'Slots Blocked',
          message: `${selectedSlots.length} time slots have been blocked.`,
          color: 'blue',
          icon: <IconCheck size={16} />,
        })
        break
    }
  }

  const getSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return timeSlots.filter(slot => slot.date === dateStr)
  }

  const getDayStats = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const daySlots = timeSlots.filter(slot => slot.date === dateStr)
    
    return {
      total: daySlots.length,
      available: daySlots.filter(slot => slot.status === 'available').length,
      booked: daySlots.filter(slot => slot.status === 'booked').length,
      blocked: daySlots.filter(slot => slot.status === 'blocked').length,
    }
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

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Paper shadow="sm" p="xl" radius="md" mb="lg">
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1} size="h2" c="#1e293b">
              Availability Management
            </Title>
            <Text c="dimmed" size="sm">
              Dr. Sarah Johnson • Cardiology • Manage your appointment schedule
            </Text>
          </Stack>
          <Group>
            <Button
              variant="outline"
              leftSection={<IconSettings size={16} />}
              onClick={() => navigate({ to: '/dashboard' })}
            >
              Back to Dashboard
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAddAvailability}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              }}
            >
              Add Availability
            </Button>
          </Group>
        </Group>
      </Paper>

      <Grid gutter="lg">
        {/* Sidebar */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Stack gap="md">
            {/* View Selector */}
            <Paper shadow="sm" p="md" radius="md">
              <Title order={4} size="h5" mb="md">Calendar View</Title>
              <Tabs value={selectedView} onChange={(value) => setSelectedView(value as 'month' | 'week' | 'day')}>
                <Tabs.List>
                  <Tabs.Tab value="month" leftSection={<IconCalendarStats size={16} />}>
                    Month
                  </Tabs.Tab>
                  <Tabs.Tab value="week" leftSection={<IconCalendarEvent size={16} />}>
                    Week
                  </Tabs.Tab>
                  <Tabs.Tab value="day" leftSection={<IconCalendarTime size={16} />}>
                    Day
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
            </Paper>

            {/* Quick Stats */}
            <Paper shadow="sm" p="md" radius="md">
              <Title order={4} size="h5" mb="md">This Week</Title>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm">Available Slots</Text>
                  <Badge color="green" variant="light">24</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Booked Appointments</Text>
                  <Badge color="blue" variant="light">18</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Blocked Time</Text>
                  <Badge color="red" variant="light">6</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Utilization</Text>
                  <Badge color="gray" variant="light">75%</Badge>
                </Group>
              </Stack>
            </Paper>

            {/* Quick Actions */}
            <Paper shadow="sm" p="md" radius="md">
              <Title order={4} size="h5" mb="md">Quick Actions</Title>
              <Stack gap="sm">
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconCopy size={16} />}
                  fullWidth
                >
                  Copy Week Schedule
                </Button>
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
                  leftSection={<IconRefresh size={16} />}
                  fullWidth
                >
                  Sync Calendar
                </Button>
              </Stack>
            </Paper>

            {/* Status Legend */}
            <Paper shadow="sm" p="md" radius="md">
              <Title order={4} size="h5" mb="md">Status Legend</Title>
              <Stack gap="xs">
                <Group gap="xs">
                  <Box style={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: 2 }} />
                  <Text size="sm">Available</Text>
                </Group>
                <Group gap="xs">
                  <Box style={{ width: 12, height: 12, backgroundColor: '#3b82f6', borderRadius: 2 }} />
                  <Text size="sm">Booked</Text>
                </Group>
                <Group gap="xs">
                  <Box style={{ width: 12, height: 12, backgroundColor: '#ef4444', borderRadius: 2 }} />
                  <Text size="sm">Blocked</Text>
                </Group>
                <Group gap="xs">
                  <Box style={{ width: 12, height: 12, backgroundColor: '#f59e0b', borderRadius: 2 }} />
                  <Text size="sm">Tentative</Text>
                </Group>
                <Group gap="xs">
                  <Box style={{ width: 12, height: 12, backgroundColor: '#6b7280', borderRadius: 2 }} />
                  <Text size="sm">Break</Text>
                </Group>
              </Stack>
            </Paper>
          </Stack>
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
                <Switch
                  label="Bulk Edit Mode"
                  checked={bulkEditMode}
                  onChange={(event) => setBulkEditMode(event.currentTarget.checked)}
                />
              </Group>
            </Group>

            {/* Calendar Content */}
            {selectedView === 'month' && (
              <div>
                {/* Month Grid */}
                <Grid gutter={0}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Grid.Col span={1} key={day}>
                      <Box p="xs" style={{ textAlign: 'center', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                        {day}
                      </Box>
                    </Grid.Col>
                  ))}
                  {calendarData.map((date, index) => {
                    const stats = getDayStats(date)
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                    const isToday = date.toDateString() === new Date().toDateString()
                    
                    return (
                      <Grid.Col span={1} key={index}>
                        <Card
                          p="xs"
                          style={{
                            minHeight: 100,
                            opacity: isCurrentMonth ? 1 : 0.5,
                            border: isToday ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setCurrentDate(date)
                            setSelectedView('day')
                          }}
                        >
                          <Text size="sm" fw={isToday ? 600 : 400}>
                            {date.getDate()}
                          </Text>
                          {stats.total > 0 && (
                            <Stack gap={2} mt="xs">
                              {stats.available > 0 && (
                                <Badge size="xs" color="green" variant="light">
                                  {stats.available} available
                                </Badge>
                              )}
                              {stats.booked > 0 && (
                                <Badge size="xs" color="blue" variant="light">
                                  {stats.booked} booked
                                </Badge>
                              )}
                            </Stack>
                          )}
                        </Card>
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
                        const slot = timeSlots.find(s => s.date === dateStr && s.startTime === time)
                        
                        return (
                          <Grid.Col span={1} key={`slot-${timeIndex}-${dateIndex}`}>
                            <Box
                              p="xs"
                              style={{
                                minHeight: 40,
                                backgroundColor: slot ? getStatusColor(slot.status) : 'transparent',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                opacity: slot ? 0.8 : 1,
                              }}
                              onClick={() => {
                                if (slot) {
                                  handleEditSlot(slot)
                                } else {
                                  // Add new slot
                                  setAddModalOpen(true)
                                }
                              }}
                            >
                              {slot && (
                                <Text size="xs" c="white" style={{ fontWeight: 500 }}>
                                  {slot.appointmentType || 'Available'}
                                </Text>
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
                <Stack gap="sm">
                  {timeSlotOptions.map((time, index) => {
                    const dateStr = currentDate.toISOString().split('T')[0]
                    const slot = timeSlots.find(s => s.date === dateStr && s.startTime === time)
                    
                    return (
                      <Card
                        key={index}
                        p="md"
                        style={{
                          border: '1px solid #e2e8f0',
                          backgroundColor: slot ? getStatusColor(slot.status) : 'white',
                        }}
                      >
                        <Group justify="space-between" align="center">
                          <Group>
                            <Text fw={500} size="sm" style={{ minWidth: 60 }}>
                              {time}
                            </Text>
                            {slot ? (
                              <Stack gap={4}>
                                <Text size="sm" c={slot.status === 'available' ? 'dark' : 'white'}>
                                  {slot.appointmentType || getStatusLabel(slot.status)}
                                </Text>
                                {slot.notes && (
                                  <Text size="xs" c={slot.status === 'available' ? 'dimmed' : 'white'} opacity={0.8}>
                                    {slot.notes}
                                  </Text>
                                )}
                              </Stack>
                            ) : (
                              <Text size="sm" c="dimmed">No appointment scheduled</Text>
                            )}
                          </Group>
                          {slot && (
                            <Group gap="xs">
                              <ActionIcon
                                variant="light"
                                size="sm"
                                onClick={() => handleEditSlot(slot)}
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="red"
                                size="sm"
                                onClick={() => handleDeleteSlot(slot.id)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          )}
                        </Group>
                      </Card>
                    )
                  })}
                </Stack>
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
        <Stack gap="md">
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                label="Start Time"
                data={timeSlotOptions}
                required
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                label="End Time"
                data={timeSlotOptions}
                required
              />
            </Grid.Col>
          </Grid>
          
          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Appointment Type"
                data={appointmentTypes}
                placeholder="Select type"
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Duration per Slot"
                data={durationOptions}
                defaultValue="30"
              />
            </Grid.Col>
          </Grid>
          
          <TextInput
            label="Notes"
            placeholder="Optional notes for this availability"
          />
          
          <Checkbox
            label="Set as recurring (weekly)"
          />
          
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddModalOpen(false)
                notifications.show({
                  title: 'Availability Added',
                  message: 'New time slots have been added to your schedule.',
                  color: 'green',
                  icon: <IconCheck size={16} />,
                })
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              }}
            >
              Add Availability
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Slot Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Time Slot"
        size="lg"
      >
        {selectedSlot && (
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Date"
                  type="date"
                  value={selectedSlot.date}
                  required
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <Select
                  label="Start Time"
                  data={timeSlotOptions}
                  value={selectedSlot.startTime}
                  required
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <Select
                  label="End Time"
                  data={timeSlotOptions}
                  value={selectedSlot.endTime}
                  required
                />
              </Grid.Col>
            </Grid>
            
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Status"
                  data={[
                    { value: 'available', label: 'Available' },
                    { value: 'blocked', label: 'Blocked' },
                    { value: 'break', label: 'Break' },
                  ]}
                  value={selectedSlot.status}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Appointment Type"
                  data={appointmentTypes}
                  value={selectedSlot.appointmentType}
                />
              </Grid.Col>
            </Grid>
            
            <TextInput
              label="Notes"
              value={selectedSlot.notes}
              placeholder="Optional notes"
            />
            
            <Group justify="space-between">
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  handleDeleteSlot(selectedSlot.id)
                  setEditModalOpen(false)
                }}
              >
                Delete Slot
              </Button>
              <Group>
                <Button variant="light" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setEditModalOpen(false)
                    notifications.show({
                      title: 'Slot Updated',
                      message: 'Time slot has been updated successfully.',
                      color: 'green',
                      icon: <IconCheck size={16} />,
                    })
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  }}
                >
                  Update Slot
                </Button>
              </Group>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
} 