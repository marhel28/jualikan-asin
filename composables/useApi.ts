// Composable for communicating with FastAPI backend
// Includes structured ApiError, token propagation, and detailed error handling

export class ApiError extends Error {
  status: number
  data: any
  detail: string

  constructor(status: number, message: string, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.detail = message
  }
}

export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = (config.public?.apiBase as string) || 'https://api-muncar.ammarabufadhel.my.id'

  const getToken = (): string | null => {
    if (import.meta.client && typeof window !== 'undefined') {
      return localStorage.getItem('lba_auth_token')
    }
    return null
  }

  const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const token = getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const url = `${apiBase}${path.startsWith('/') ? path : `/${path}`}`

    let res: Response
    try {
      res = await fetch(url, {
        ...options,
        headers,
      })
    } catch (networkErr: any) {
      throw new ApiError(
        0,
        'Gagal terhubung ke server. Pastikan koneksi internet atau layanan backend aktif.',
        networkErr
      )
    }

    if (!res.ok) {
      let errorData: any = null
      let errorMessage = `Permintaan gagal (HTTP ${res.status})`

      try {
        errorData = await res.json()
        if (typeof errorData?.detail === 'string') {
          errorMessage = errorData.detail
        } else if (Array.isArray(errorData?.detail)) {
          // FastAPI / Pydantic validation errors
          errorMessage = errorData.detail.map((e: any) => e.msg || e.message).join(', ')
        } else if (errorData?.message) {
          errorMessage = errorData.message
        }
      } catch {
        errorMessage = res.statusText || errorMessage
      }

      // Handle 401 Unauthorized for authenticated endpoints
      if (res.status === 401 && path !== '/account/login' && path !== '/account/register') {
        if (import.meta.client && typeof window !== 'undefined') {
          localStorage.removeItem('lba_auth_token')
        }
      }

      throw new ApiError(res.status, errorMessage, errorData)
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return null as T
    }

    try {
      return (await res.json()) as T
    } catch {
      return null as T
    }
  }

  return {
    apiBase,
    getToken,
    request,
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    // Safe fallback method for components expecting null instead of throw
    requestSafe: async <T>(path: string, options: RequestInit = {}): Promise<T | null> => {
      try {
        return await request<T>(path, options)
      } catch {
        return null
      }
    }
  }
}
