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
  },
  patient: {
    register: (data: PatientCreateRequest) => apiService.registerPatient(data),
    login: (data: PatientLoginRequest) => apiService.loginPatient(data),
    logout: () => apiService.logoutPatient(),
    verifyEmail: (token: string) => apiService.verifyPatientEmail(token),
    getProfile: (patientId: string) => apiService.getPatientProfile(patientId),
  },
} 