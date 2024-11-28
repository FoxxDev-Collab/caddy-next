import { useToast } from "../../app/components/ui/use-toast"
import { formatError } from "../utils"

interface ApiOptions {
  showSuccessToast?: boolean
  successMessage?: string
}

// Use a more specific type that still allows for flexible object structures
type RequestData = Record<string, unknown> | Array<unknown>

export function useApi() {
  const { toast } = useToast()

  const handleRequest = async <T>(
    requestFn: () => Promise<T>,
    options: ApiOptions = {}
  ): Promise<T | null> => {
    try {
      const result = await requestFn()
      
      if (options.showSuccessToast) {
        toast({
          title: "Success",
          description: options.successMessage || "Operation completed successfully",
        })
      }
      
      return result
    } catch (error) {
      console.error("API Error:", error)
      
      toast({
        variant: "destructive",
        title: "Error",
        description: formatError(error),
      })
      
      return null
    }
  }

  const handleResponse = async (response: Response) => {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.status === 404 
          ? 'Resource not found'
          : response.status === 401
          ? 'Unauthorized - Please log in again'
          : 'An error occurred while processing your request'
      }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  // Default fetch options to include with all requests
  const defaultOptions = {
    credentials: 'include' as RequestCredentials,
    headers: {
      'Content-Type': 'application/json',
    }
  }

  const get = async <T>(url: string, options?: ApiOptions): Promise<T | null> => {
    return handleRequest(async () => {
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'GET'
      })
      return handleResponse(response)
    }, options)
  }

  const post = async <T>(url: string, data: RequestData, options?: ApiOptions): Promise<T | null> => {
    return handleRequest(async () => {
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    }, options)
  }

  const put = async <T>(url: string, data: RequestData, options?: ApiOptions): Promise<T | null> => {
    return handleRequest(async () => {
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    }, options)
  }

  const del = async <T>(url: string, options?: ApiOptions): Promise<T | null> => {
    return handleRequest(async () => {
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'DELETE',
      })
      return handleResponse(response)
    }, options)
  }

  return {
    get,
    post,
    put,
    delete: del
  }
}
