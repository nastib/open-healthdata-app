import { type DataCategory } from '@prisma/client'
import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'

interface CategoriesStore {
  categories: Ref<DataCategory[] | null>
  selectedCategory: Ref<DataCategory | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  createCategory: (input: Omit<DataCategory, 'id'>) => Promise<void>
  updateCategory: (id: number, input: Partial<DataCategory>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  fetchCategories: () => Promise<void>
  fetchCategoryById: (id: number) => Promise<void>
  resetSelectedCategory: () => void
}

export const useCategoriesStore = defineStore('categories-store', (): CategoriesStore => {
  const categories = ref<DataCategory[] | null>(null)
  const selectedCategory = ref<DataCategory | null>(null)
  const { loadSession } = useSessionPersistence()
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const LIMIT = import.meta.env.DEV ? 10 : import.meta.env.VITE_QUERY_LIMIT
  const OFFSET = import.meta.env.DEV ? 0 : import.meta.env.VITE_QUERY_OFFSET
  const SORT = import.meta.env.DEV ? 'asc' : import.meta.env.VITE_QUERY_SORT


  /**
   * Create a new data category
   * @param input Category input without ID
   */
  const createCategory = async (input: Omit<DataCategory, 'id'>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $fetch<{data: DataCategory, error?: any}>('/api/categories', {
        method: 'POST',
        body: input,
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to create category'
        })
        toast.error(fetchError?.statusMessage || 'Failed to create category')
        throw createError(fetchError?.statusMessage || 'Failed to create category')
      }

      categories.value = [...(categories.value || []), data]
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to create data category'
      error.value = createError({ statusCode: 500, statusMessage: message })
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing data category
   * @param id Category ID to update
   * @param input Partial category input
   */
  const updateCategory = async (id: number, input: Partial<DataCategory>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $fetch<{data: DataCategory, error?: any}>(`/api/categories/${id}`, {
        method: 'PUT',
        body: input,
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to update category'
        })
        toast.error(fetchError?.statusMessage || 'Failed to update category')
        throw createError(fetchError?.statusMessage || 'Failed to update category')
      }

      categories.value = categories.value?.map(cat =>
        cat.id === id ? { ...cat, ...data } : cat
      ) || null

      if (selectedCategory.value?.id === id) {
        selectedCategory.value = { ...selectedCategory.value, ...input }
      }
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to update data category'
      error.value = createError({ statusCode: 500, statusMessage: message })
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a data category
   * @param id Category ID to delete
   */
  const deleteCategory = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const { error: fetchError } = await $fetch<{error?: any}>(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        }
      })

      if (fetchError) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to delete category'
        })
        toast.error(fetchError?.statusMessage || 'Failed to delete category')
        throw createError(fetchError?.statusMessage || 'Failed to delete category')
      }

      categories.value = categories.value?.filter(cat => cat.id !== id) || null
      if (selectedCategory.value?.id === id) {
        resetSelectedCategory()
      }
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to delete data category'
      error.value = createError({ statusCode: 500, statusMessage: message })
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch all data categories
   */
  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    console.log('fetchCategories',LIMIT);

    try {
      const query = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: OFFSET.toString(),
        sort: SORT
      }).toString()
      const { data, error: fetchError } = await $fetch<{data: DataCategory[], error?: any}>(`/api/categories?${query}`,{
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Failed to fetch categories'
        })
        toast.error(fetchError?.statusMessage || 'Failed to fetch categories')
        throw createError(fetchError?.statusMessage || 'Failed to fetch categories')
      }

      categories.value = data
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch data categories'
      error.value = createError({ statusCode: 500, statusMessage: message })
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single data category by ID
   * @param id Category ID to fetch
   */
  const fetchCategoryById = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $fetch<{data: DataCategory, error?: any}>(`/api/categories/${id}`,{
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        }
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Category not found'
        })
        toast.error(fetchError?.statusMessage || 'Category not found')
        throw createError(fetchError?.statusMessage || 'Category not found')
      }

      selectedCategory.value = data
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch data category'
      error.value = createError({ statusCode: 500, statusMessage: message })
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  const resetSelectedCategory = () => {
    selectedCategory.value = null
  }

  return {
    categories,
    selectedCategory,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
    fetchCategoryById,
    resetSelectedCategory
  }
})


// make sure to pass the right store definition, `useCategoriesStore` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCategoriesStore, import.meta.hot))
}
