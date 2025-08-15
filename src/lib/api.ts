// Generic API utility with retry logic, timeout handling, and error management
// This can be used for all API calls beyond just authentication

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
export const fetchWithRetry = async (
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
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
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

// Generic API client with common HTTP methods
export const apiClient = {
  // GET request
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    return handleApiResponse<T>(response)
  },

  // POST request
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    
    return handleApiResponse<T>(response)
  },

  // PUT request
  async put<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    
    return handleApiResponse<T>(response)
  },

  // DELETE request
  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    return handleApiResponse<T>(response)
  },

  // PATCH request
  async patch<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    
    return handleApiResponse<T>(response)
  },

  // File upload with FormData
  async upload<T>(endpoint: string, formData: FormData, options: RequestInit = {}): Promise<T> {
    const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...options.headers,
      },
      body: formData,
      ...options,
    })
    
    return handleApiResponse<T>(response)
  }
}

// Utility to add authentication headers
export const withAuth = (options: RequestInit = {}): RequestInit => {
  const token = localStorage.getItem('devcollab_token')
  
  if (token) {
    return {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    }
  }
  
  return options
}

// Health check utility
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
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
