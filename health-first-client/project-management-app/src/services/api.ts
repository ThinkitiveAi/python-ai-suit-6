const API_BASE_URL = 'http://192.168.0.194:8000/api/v1'

// Types for API requests and responses
export interface Address {
  street: string
  city: string
  state: string
  zip: string
}

export interface ClinicAddress {
  street: string
  city: string
  state: string
  zip: string
}

export interface EmergencyContact {
  name?: string | null
  phone?: string | null
  relationship?: string | null
}

export interface InsuranceInfo {
  provider?: string | null
  policy_number?: string | null
}

// Availability Types
export type AppointmentType = 'consultation' | 'follow_up' | 'emergency' | 'telemedicine'
export type AvailabilityStatus = 'available' | 'booked' | 'cancelled' | 'blocked' | 'maintenance'
export type LocationType = 'clinic' | 'hospital' | 'telemedicine' | 'home_visit'
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly'

export interface Location {
  type: LocationType
  address?: string | null
  room_number?: string | null
}

export interface Pricing {
  base_fee: number
  insurance_accepted?: boolean
  currency?: string
}

export interface RecurrencePattern {
  pattern: RecurrencePattern
  interval?: number
  days_of_week?: number[]
  day_of_month?: number
}

// Provider Types
export interface ProviderCreateRequest {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  specialization: string
  license_number: string
  years_of_experience: number
  clinic_address: ClinicAddress
  license_document_url: string | null
  password: string
  confirm_password: string
}

export interface ProviderLoginRequest {
  email: string
  password: string
}

export interface ProviderAvailabilityCreate {
  provider_id: string
  date: string
  start_time: string
  end_time: string
  timezone?: string
  is_recurring?: boolean
  recurrence_pattern?: RecurrencePattern | null
  recurrence_end_date?: string | null
  slot_duration?: number
  break_duration?: number
  status?: AvailabilityStatus
  max_appointments_per_slot?: number
  appointment_type?: AppointmentType
  location: Location
  pricing?: Pricing | null
  notes?: string | null
  special_requirements?: string[]
}

export interface ProviderAvailabilityUpdate {
  start_time?: string | null
  end_time?: string | null
  status?: AvailabilityStatus | null
  notes?: string | null
  pricing?: Pricing | null
  special_requirements?: string[] | null
}

export interface AvailabilitySearchParams {
  date?: string | null
  start_date?: string | null
  end_date?: string | null
  specialization?: string | null
  location?: string | null
  appointment_type?: string | null
  insurance_accepted?: boolean | null
  max_price?: number | null
  timezone?: string | null
  available_only?: boolean
}

export interface ProviderAvailabilityParams {
  start_date?: string | null
  end_date?: string | null
  status?: string | null
  appointment_type?: string | null
  timezone?: string | null
}

// Patient Types
export interface PatientCreateRequest {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address: Address
  emergency_contact?: EmergencyContact | null
  medical_history?: string[] | null
  insurance_info?: InsuranceInfo | null
  password: string
  confirm_password: string
}

export interface PatientLoginRequest {
  email: string
  password: string
}

export interface EmailVerificationRequest {
  token: string
}

// Common Types
export interface RefreshTokenRequest {
  refresh_token: string
}

export interface LogoutAllRequest {
  password: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// API Service class
class ApiService {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.detail?.message || data.detail || data.message || 'An error occurred',
        }
      }

      // Handle the actual API response format
      if (data.success !== undefined) {
        return {
          success: data.success,
          data: data.data,
          message: data.message,
          error: data.success ? undefined : (data.message || 'An error occurred'),
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Provider Endpoints
  async registerProvider(providerData: ProviderCreateRequest): Promise<ApiResponse> {
    return this.makeRequest('/provider/register', {
      method: 'POST',
      body: JSON.stringify(providerData),
    })
  }

  async loginProvider(loginData: ProviderLoginRequest): Promise<ApiResponse> {
    return this.makeRequest('/provider/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })
  }

  async logoutProvider(refreshToken: string): Promise<ApiResponse> {
    return this.makeRequest('/provider/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  async logoutAllProvider(password: string): Promise<ApiResponse> {
    return this.makeRequest('/provider/logout-all', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  }

  async refreshProviderToken(refreshToken: string): Promise<ApiResponse> {
    return this.makeRequest('/provider/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  // Provider Availability Endpoints
  async createAvailability(availabilityData: ProviderAvailabilityCreate): Promise<ApiResponse> {
    return this.makeRequest('/provider/availability', {
      method: 'POST',
      body: JSON.stringify(availabilityData),
    })
  }

  async getProviderAvailability(providerId: string, params?: ProviderAvailabilityParams): Promise<ApiResponse> {
    const queryParams = new URLSearchParams()
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.appointment_type) queryParams.append('appointment_type', params.appointment_type)
    if (params?.timezone) queryParams.append('timezone', params.timezone)

    const queryString = queryParams.toString()
    const url = `/provider/${providerId}/availability${queryString ? `?${queryString}` : ''}`
    
    return this.makeRequest(url, {
      method: 'GET',
    })
  }

  async updateAvailabilitySlot(slotId: string, updateData: ProviderAvailabilityUpdate): Promise<ApiResponse> {
    return this.makeRequest(`/provider/availability/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  }

  async deleteAvailabilitySlot(slotId: string, deleteRecurring?: boolean, reason?: string): Promise<ApiResponse> {
    const queryParams = new URLSearchParams()
    if (deleteRecurring !== undefined) queryParams.append('delete_recurring', deleteRecurring.toString())
    if (reason) queryParams.append('reason', reason)

    const queryString = queryParams.toString()
    const url = `/provider/availability/${slotId}${queryString ? `?${queryString}` : ''}`
    
    return this.makeRequest(url, {
      method: 'DELETE',
    })
  }

  async searchAvailability(params?: AvailabilitySearchParams): Promise<ApiResponse> {
    const queryParams = new URLSearchParams()
    if (params?.date) queryParams.append('date', params.date)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    if (params?.specialization) queryParams.append('specialization', params.specialization)
    if (params?.location) queryParams.append('location', params.location)
    if (params?.appointment_type) queryParams.append('appointment_type', params.appointment_type)
    if (params?.insurance_accepted !== undefined) queryParams.append('insurance_accepted', params.insurance_accepted.toString())
    if (params?.max_price) queryParams.append('max_price', params.max_price.toString())
    if (params?.timezone) queryParams.append('timezone', params.timezone)
    if (params?.available_only !== undefined) queryParams.append('available_only', params.available_only.toString())

    const queryString = queryParams.toString()
    const url = `/provider/availability/search${queryString ? `?${queryString}` : ''}`
    
    return this.makeRequest(url, {
      method: 'GET',
    })
  }

  // Patient Endpoints
  async registerPatient(patientData: PatientCreateRequest): Promise<ApiResponse> {
    return this.makeRequest('/patient/register', {
      method: 'POST',
      body: JSON.stringify(patientData),
    })
  }

  async loginPatient(loginData: PatientLoginRequest): Promise<ApiResponse> {
    return this.makeRequest('/patient/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })
  }

  async logoutPatient(): Promise<ApiResponse> {
    return this.makeRequest('/patient/logout', {
      method: 'POST',
    })
  }

  async verifyPatientEmail(token: string): Promise<ApiResponse> {
    return this.makeRequest('/patient/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  async getPatientProfile(patientId: string): Promise<ApiResponse> {
    return this.makeRequest(`/patient/profile/${patientId}`, {
      method: 'GET',
    })
  }
}

// Export singleton instance
export const apiService = new ApiService()

// Helper functions for common operations
export const api = {
  provider: {
    register: (data: ProviderCreateRequest) => apiService.registerProvider(data),
    login: (data: ProviderLoginRequest) => apiService.loginProvider(data),
    logout: (refreshToken: string) => apiService.logoutProvider(refreshToken),
    logoutAll: (password: string) => apiService.logoutAllProvider(password),
    refresh: (refreshToken: string) => apiService.refreshProviderToken(refreshToken),
    availability: {
      create: (data: ProviderAvailabilityCreate) => apiService.createAvailability(data),
      get: (providerId: string, params?: ProviderAvailabilityParams) => apiService.getProviderAvailability(providerId, params),
      update: (slotId: string, data: ProviderAvailabilityUpdate) => apiService.updateAvailabilitySlot(slotId, data),
      delete: (slotId: string, deleteRecurring?: boolean, reason?: string) => apiService.deleteAvailabilitySlot(slotId, deleteRecurring, reason),
      search: (params?: AvailabilitySearchParams) => apiService.searchAvailability(params),
    },
  },
  patient: {
    register: (data: PatientCreateRequest) => apiService.registerPatient(data),
    login: (data: PatientLoginRequest) => apiService.loginPatient(data),
    logout: () => apiService.logoutPatient(),
    verifyEmail: (token: string) => apiService.verifyPatientEmail(token),
    getProfile: (patientId: string) => apiService.getPatientProfile(patientId),
  },
} 