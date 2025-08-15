// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api'

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  timeout: 15000, // 15 seconds
}

// Utility function for exponential backoff delay
const getRetryDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt)
  return Math.min(delay, RETRY_CONFIG.maxDelay)
}

// Enhanced fetch with retry logic, timeout, and better error handling
const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> => {
  try {
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.timeout)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // If response is ok, return it
    if (response.ok) {
      return response
    }

    // Don't retry on client errors (4xx) except 429 (rate limit)
    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      return response
    }

    // Retry logic for server errors (5xx) and rate limits (429)
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delay = getRetryDelay(retryCount)
      console.log(`🔄 Retrying request (${retryCount + 1}/${RETRY_CONFIG.maxRetries}) after ${delay}ms...`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return fetchWithRetry(url, options, retryCount + 1)
    }

    return response
  } catch (error) {
    // Handle timeout and network errors
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('⏰ Request timed out')
      throw new Error('Request timed out. Please check your connection and try again.')
    }

    // Retry on network errors
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delay = getRetryDelay(retryCount)
      console.log(`🌐 Network error, retrying (${retryCount + 1}/${RETRY_CONFIG.maxRetries}) after ${delay}ms...`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      
      return fetchWithRetry(url, options, retryCount + 1)
    }

    // If all retries failed, throw the error
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`)
    }
    
    throw new Error('An unexpected error occurred')
  }
}

// Enhanced API response handler
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = 'An error occurred'
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // If we can't parse the error response, use status text
      errorMessage = response.statusText || errorMessage
    }

    // Handle specific status codes
    switch (response.status) {
      case 401:
        throw new Error('Unauthorized. Please log in again.')
      case 403:
        throw new Error('Access denied. You don\'t have permission for this action.')
      case 404:
        throw new Error('Resource not found.')
      case 429:
        throw new Error('Too many requests. Please wait a moment and try again.')
      case 500:
        throw new Error('Server error. Please try again later.')
      case 503:
        throw new Error('Service temporarily unavailable. Please try again later.')
      default:
        throw new Error(errorMessage)
    }
  }

  try {
    return await response.json()
  } catch (error) {
    throw new Error('Invalid response format from server')
  }
}

// Types
export interface User {
  _id: string
  name: string
  email: string
  image?: string
  isVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginResponse {
  user: User
  token: string
  requiresVerification?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  image?: File
}

export interface LoginData {
  email: string
  password: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// API functions with retry logic
export const authApi = {
  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('password', data.password)
      if (data.image) {
        formData.append('image', data.image)
      }

      const response = await fetchWithRetry(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formData,
      })

      return handleApiResponse<AuthResponse>(response)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  // Login user
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await handleApiResponse<LoginResponse>(response)
      
      // Check if user needs verification
      if (result.requiresVerification) {
        throw new Error('EMAIL_NOT_VERIFIED')
      }

      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const token = tokenStorage.getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetchWithRetry(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      return handleApiResponse<User>(response)
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  },

  // Resend verification email
  async resendVerification(email: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      return handleApiResponse<ApiResponse<null>>(response)
    } catch (error) {
      console.error('Resend verification error:', error)
      throw error
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      return handleApiResponse<AuthResponse>(response)
    } catch (error) {
      console.error('Email verification error:', error)
      throw error
    }
  },

  // Health check (for wake-up calls)
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return handleApiResponse<{ status: string; message: string }>(response)
    } catch (error) {
      console.error('Health check error:', error)
      throw error
    }
  }
}

// Token storage utilities
export const tokenStorage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('devcollab_token')
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('devcollab_token', token)
  },

  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('devcollab_token')
  },

  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('devcollab_token')
    localStorage.removeItem('devcollab_user')
  }
}
