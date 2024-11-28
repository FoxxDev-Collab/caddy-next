import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  )
}

// Helper to handle API responses
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred while processing your request'
    }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}
