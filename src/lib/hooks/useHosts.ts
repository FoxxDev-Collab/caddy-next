import useSWR, { mutate } from 'swr'
import { useApi } from './useApi'
import { CaddyHost } from '../caddy/types'

const HOSTS_KEY = '/api/hosts'

export function useHosts() {
  const api = useApi()
  const { data: hosts, error, isLoading } = useSWR<CaddyHost[]>(
    HOSTS_KEY,
    async () => {
      const result = await api.get<CaddyHost[]>(HOSTS_KEY)
      return result || []
    }
  )

  const addHost = async (host: Omit<CaddyHost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = await api.post<CaddyHost>(HOSTS_KEY, host as Record<string, unknown>, {
      showSuccessToast: true,
      successMessage: 'Host added successfully'
    })
    if (result) {
      await mutate(HOSTS_KEY)
    }
    return result
  }

  const updateHost = async (host: CaddyHost) => {
    const result = await api.put<CaddyHost>(
      `${HOSTS_KEY}/${host.id}`,
      host as unknown as Record<string, unknown>,
      {
        showSuccessToast: true,
        successMessage: 'Host updated successfully'
      }
    )
    if (result) {
      await mutate(HOSTS_KEY)
    }
    return result
  }

  const deleteHost = async (hostId: string) => {
    const result = await api.delete<{ success: boolean }>(
      `${HOSTS_KEY}/${hostId}`,
      {
        showSuccessToast: true,
        successMessage: 'Host deleted successfully'
      }
    )
    if (result) {
      await mutate(HOSTS_KEY)
    }
    return result
  }

  return {
    hosts: hosts || [],
    isLoading,
    error,
    addHost,
    updateHost,
    deleteHost,
    mutate: () => mutate(HOSTS_KEY)
  }
}
