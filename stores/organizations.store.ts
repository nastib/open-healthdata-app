import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'
import type { ErrorWithStatus } from '~/types';
import {
  type Organization,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
  type OrganizationQuery,
} from '~/server/schemas/organizations.schemas'

interface OrganizationsStore {
  organizations: Ref<Organization[] | null>
  selectedOrganization: Ref<Organization | null>
  loading: Ref<boolean>
  error: Ref<ErrorWithStatus | null>
  createOrganization: (input: CreateOrganizationInput) => Promise<void>
  updateOrganization: (id: number, input: UpdateOrganizationInput) => Promise<void>
  deleteOrganization: (id: number) => Promise<void>
  fetchOrganizations: (query?: OrganizationQuery) => Promise<void>
  fetchOrganizationById: (id: number) => Promise<void>
  resetSelectedOrganization: () => void
}

export const useOrganizationsStore = defineStore('organizations-store', (): OrganizationsStore => {
  const organizations = ref<Organization[] | null>(null)
  const selectedOrganization = ref<Organization | null>(null)
  const { loadSession } = useSessionPersistence()
  const loading = ref(false)
  const error = ref<ErrorWithStatus | null>(null)

  // Environment variables for query defaults, following categories.store.ts pattern
  const LIMIT = import.meta.env.DEV ? 10 : import.meta.env.VITE_QUERY_LIMIT
  const OFFSET = import.meta.env.DEV ? 0 : import.meta.env.VITE_QUERY_OFFSET
  const SORT = import.meta.env.DEV ? 'asc' : import.meta.env.VITE_QUERY_SORT

  /**
   * Create a new organization
   * @param input Organization input
   */
  const createOrganization = async (input: CreateOrganizationInput) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $fetch<{ data: Organization, error?: any }>('/api/organizations', {
        method: 'POST',
        body: input,
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = new Error(fetchError?.statusMessage || 'Failed to create organization') as ErrorWithStatus
        toast.error(fetchError?.statusMessage || 'Failed to create organization')
        throw error.value
      }

      organizations.value = [...(organizations.value || []), data]
      toast.success('Organization created successfully!')
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to create organization'
      error.value = new Error(message) as ErrorWithStatus
      toast.error(message)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing organization
   * @param id Organization ID to update
   * @param input Partial organization input
   */
  const updateOrganization = async (id: number, input: UpdateOrganizationInput) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $fetch<{ data: Organization, error?: any }>(`/api/organizations/${id}`, {
        method: 'PUT',
        body: input,
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = new Error(fetchError?.statusMessage || 'Failed to update organization') as ErrorWithStatus
        toast.error(fetchError?.statusMessage || 'Failed to update organization')
        throw error.value
      }

      organizations.value = organizations.value?.map(org =>
        org.id === id ? { ...org, ...data } : org
      ) || null

      if (selectedOrganization.value?.id === id) {
        selectedOrganization.value = { ...selectedOrganization.value, ...input }
      }
      toast.success('Organization updated successfully!')
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to update organization'
      error.value = new Error(message) as ErrorWithStatus
      toast.error(message)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an organization
   * @param id Organization ID to delete
   */
  const deleteOrganization = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const { error: fetchError } = await $fetch<{ error?: any }>(`/api/organizations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      })

      if (fetchError) {
        error.value = new Error(fetchError?.statusMessage || 'Failed to delete organization') as ErrorWithStatus
        toast.error(fetchError?.statusMessage || 'Failed to delete organization')
        throw error.value
      }

      organizations.value = organizations.value?.filter(org => org.id !== id) || null
      if (selectedOrganization.value?.id === id) {
        resetSelectedOrganization()
      }
      toast.success('Organization deleted successfully!')
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to delete organization'
      error.value = new Error(message) as ErrorWithStatus
      toast.error(message)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all organizations
   * @param query Optional query parameters
   */
  const fetchOrganizations = async (query?: OrganizationQuery) => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        limit: (query?.limit || LIMIT).toString(),
        offset: (query?.offset || OFFSET).toString(),
        sort: query?.sort || SORT,
        ...(query?.search && { search: query.search })
      }).toString()

      const { data, error: fetchError } = await $fetch<{ data: Organization[], error?: any }>(`/api/organizations?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = new Error(fetchError?.statusMessage || 'Failed to fetch organizations') as ErrorWithStatus
        toast.error(fetchError?.statusMessage || 'Failed to fetch organizations')
        throw error.value
      }

      organizations.value = data
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch organizations'
      error.value = new Error(message) as ErrorWithStatus
      toast.error(message)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single organization by ID
   * @param id Organization ID to fetch
   */
  const fetchOrganizationById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $fetch<{ data: Organization, error?: any }>(`/api/organizations/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = new Error(fetchError?.statusMessage || 'Organization not found') as ErrorWithStatus
        toast.error(fetchError?.statusMessage || 'Organization not found')
        throw error.value
      }

      selectedOrganization.value = data
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch organization'
      error.value = new Error(message) as ErrorWithStatus
      toast.error(message)
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const resetSelectedOrganization = () => {
    selectedOrganization.value = null
  }

  return {
    organizations,
    selectedOrganization,
    loading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    fetchOrganizations,
    fetchOrganizationById,
    resetSelectedOrganization
  }
})

// make sure to pass the right store definition, `useOrganizationsStore` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrganizationsStore, import.meta.hot))
}
