import { defineStore } from 'pinia';
import { toast } from 'vue-sonner';
import type { DataSource } from '@prisma/client';

interface SourcesStore {
  sources: Ref<DataSource[] | null>;
  selectedSource: Ref<DataSource | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  createSource: (input: Omit<DataSource, 'id'>) => Promise<void>;
  updateSource: (id: number, input: Partial<DataSource>) => Promise<void>;
  deleteSource: (id: number) => Promise<void>;
  fetchSources: () => Promise<void>;
  fetchSourceById: (id: number) => Promise<void>;
  resetSelectedSource: () => void;
}

export const useSourcesStore = defineStore('sources-store', (): SourcesStore => {
  const sources = ref<DataSource[] | null>(null);
  const selectedSource = ref<DataSource | null>(null);
  const { loadSession } = useSessionPersistence();
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const LIMIT = import.meta.env.DEV ? 10 : import.meta.env.VITE_QUERY_LIMIT;
  const OFFSET = import.meta.env.DEV ? 0 : import.meta.env.VITE_QUERY_OFFSET;
  const SORT = import.meta.env.DEV ? 'asc' : import.meta.env.VITE_QUERY_SORT;

  /**
   * Fetch all data sources
   */
  const fetchSources = async () => {
    loading.value = true;
    error.value = null;

    try {
      const query = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: OFFSET.toString(),
        sort: SORT
      }).toString();
      const { data, error: fetchError } = await $fetch<{ data: DataSource[], error?: any }>(`/api/sources?${query}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Failed to fetch data sources'
        });
        toast.error(fetchError?.statusMessage || 'Failed to fetch data sources');
        throw createError(fetchError?.statusMessage || 'Failed to fetch data sources');
      }

      sources.value = data;
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch data sources';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch a single data source by ID
   * @param id Data Source ID to fetch
   */
  const fetchSourceById = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await $fetch<{ data: DataSource, error?: any }>(`/api/sources/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Data Source not found'
        });
        toast.error(fetchError?.statusMessage || 'Data Source not found');
        throw createError(fetchError?.statusMessage || 'Data Source not found');
      }

      selectedSource.value = data;
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch data source';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a new data source
   * @param input Data Source input without ID
   */
  const createSource = async (input: Omit<DataSource, 'id'>) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await $fetch<{ data: DataSource, error?: any }>('/api/data-sources', {
        method: 'POST',
        body: input,
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to create data source'
        });
        toast.error(fetchError?.statusMessage || 'Failed to create data source');
        throw createError(fetchError?.statusMessage || 'Failed to create data source');
      }

      sources.value = [...(sources.value || []), data];
      toast.success('Data Source created successfully');
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to create data source';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update an existing data source
   * @param id Data Source ID to update
   * @param input Partial data source input
   */
  const updateSource = async (id: number, input: Partial<DataSource>) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await $fetch<{ data: DataSource, error?: any }>(`/api/sources/${id}`, {
        method: 'PUT',
        body: input,
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to update data source'
        });
        toast.error(fetchError?.statusMessage || 'Failed to update data source');
        throw createError(fetchError?.statusMessage || 'Failed to update data source');
      }

      sources.value = sources.value?.map(ds =>
        ds.id === id ? { ...ds, ...data } : ds
      ) || null;

      if (selectedSource.value?.id === id) {
        selectedSource.value = { ...selectedSource.value, ...input };
      }
      toast.success('Data Source updated successfully');
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to update data source';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a data source
   * @param id Data Source ID to delete
   */
  const deleteSource = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: fetchError } = await $fetch<{ error?: any }>(`/api/sources/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to delete data source'
        });
        toast.error(fetchError?.statusMessage || 'Failed to delete data source');
        throw createError(fetchError?.statusMessage || 'Failed to delete data source');
      }

      sources.value = sources.value?.filter(ds => ds.id !== id) || null;
      if (selectedSource.value?.id === id) {
        resetSelectedSource();
      }
      toast.success('Data Source deleted successfully');
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to delete data source';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  const resetSelectedSource = () => {
    selectedSource.value = null;
  };

  return {
    sources,
    selectedSource,
    loading,
    error,
    createSource,
    updateSource,
    deleteSource,
    fetchSources,
    fetchSourceById,
    resetSelectedSource
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSourcesStore, import.meta.hot));
}
