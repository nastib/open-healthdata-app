import { type DataEntry } from '@prisma/client'
import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'

interface DataEntriesStore {
  entries: Ref<DataEntry[] | null>
  selectedEntry: Ref<DataEntry | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  createEntry: (input: Omit<DataEntry, 'id'>) => Promise<void>
  updateEntry: (id: number, input: Partial<DataEntry>) => Promise<void>
  deleteEntry: (id: number) => Promise<void>
  fetchEntries: () => Promise<void>
  fetchEntryById: (id: number) => Promise<void>
  resetSelectedEntry: () => void
}

export const useEntriesStore = defineStore('entries-store', (): DataEntriesStore => {
  const entries = ref<DataEntry[] | null>(null)
  const selectedEntry = ref<DataEntry | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const OFFSET = import.meta.env.DEV ? 0 : import.meta.env.VITE_QUERY_OFFSET
  const SORT = import.meta.env.DEV ? 'asc' : import.meta.env.VITE_QUERY_SORT
  const LIMIT = import.meta.env.DEV ? 10 : import.meta.env.VITE_QUERY_LIMIT
  const { loadSession } = useSessionPersistence()

  /**
   * Create a new data entry
   * @param input Data entry input without ID
   */
  const createEntry = async (input: Omit<DataEntry, 'id'>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $fetch<{data: DataEntry, error?: any}>('/api/entries', {
        method: 'POST',
        body: input,
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to create entry'
        })
        toast.error(fetchError?.statusMessage || 'Failed to create entry')
        throw createError(fetchError?.statusMessage || 'Failed to create entry')
      }

      entries.value = [...(entries.value || []), data]
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to create data entry'
      error.value = createError({ statusCode: 500, statusMessage: message })
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing data entry
   * @param id Entry ID to update
   * @param input Partial data entry input
   */
  const updateEntry = async (id: number, input: Partial<DataEntry>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $fetch<{data: DataEntry, error?: any}>(`/api/entries/${id}`, {
        method: 'PUT',
        body: input,
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to update entry'
        })
        toast.error(fetchError?.statusMessage || 'Failed to update entry')
        throw createError(fetchError?.statusMessage || 'Failed to update entry')
      }

      entries.value = entries.value?.map(entry =>
        entry.id === id ? { ...entry, ...data } : entry
      ) || null

      if (selectedEntry.value?.id === id) {
        selectedEntry.value = { ...selectedEntry.value, ...input }
      }
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to update data entry'
      error.value = createError({ statusCode: 500, statusMessage: message })
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a data entry
   * @param id Entry ID to delete
   */
  const deleteEntry = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const { error: fetchError } = await $fetch<{error?: any}>(`/api/entries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        }
      })

      if (fetchError) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to delete entry'
        })
        toast.error(fetchError?.statusMessage || 'Failed to delete entry')
        throw createError(fetchError?.statusMessage || 'Failed to delete entry')
      }

      entries.value = entries.value?.filter(entry => entry.id !== id) || null
      if (selectedEntry.value?.id === id) {
        resetSelectedEntry()
      }
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to delete data entry'
      error.value = createError({ statusCode: 500, statusMessage: message })
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all data entries
   */
  const fetchEntries = async () => {
    loading.value = true
    error.value = null

    try {
      const query = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: OFFSET.toString(),
        sort: SORT
      }).toString()
      const { data, error: fetchError } = await $fetch<{data: DataEntry[], error?: any}>(`/api/entries?${query}`,{
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        }
      })
      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Failed to fetch entries'
        })
        toast.error(fetchError?.statusMessage || 'Failed to fetch entries')
        throw createError(fetchError?.statusMessage || 'Failed to fetch entries')
      }

      entries.value = data
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch data entries'
      error.value = createError({ statusCode: 500, statusMessage: message })
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single data entry by ID
   * @param id Entry ID to fetch
   */
  const fetchEntryById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $fetch<{data: DataEntry, error?: any}>(`/api/entries/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Entry not found'
        })
        toast.error(fetchError?.statusMessage || 'Entry not found')
        throw createError(fetchError?.statusMessage || 'Entry not found')
      }

      selectedEntry.value = data
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch data entry'
      error.value = createError({ statusCode: 500, statusMessage: message })
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  const resetSelectedEntry = () => {
    selectedEntry.value = null
  }

  return {
    entries,
    selectedEntry,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    fetchEntries,
    fetchEntryById,
    resetSelectedEntry
  }
})

// make sure to pass the right store definition, `useDataEntriesStore` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEntriesStore, import.meta.hot))
}


