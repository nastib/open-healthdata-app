import { defineStore } from 'pinia';
import { toast } from 'vue-sonner';
import type { Indicator } from '~/server/schemas/indicators.schema';

interface IndicatorsStore {
  indicators: Ref<Indicator[] | null>;
  selectedIndicator: Ref<Indicator | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  createIndicator: (input: Omit<Indicator, 'id'>) => Promise<void>;
  updateIndicator: (id: number, input: Partial<Indicator>) => Promise<void>;
  deleteIndicator: (id: number) => Promise<void>;
  fetchIndicators: () => Promise<void>;
  fetchIndicatorById: (id: number) => Promise<void>;
  resetSelectedIndicator: () => void;
}

export const useIndicatorsStore = defineStore('indicators-store', (): IndicatorsStore => {
  const indicators = ref<Indicator[] | null>(null);
  const selectedIndicator = ref<Indicator | null>(null);
  const { loadSession } = useSessionPersistence();
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const LIMIT = import.meta.env.DEV ? 10 : import.meta.env.VITE_QUERY_LIMIT;
  const OFFSET = import.meta.env.DEV ? 0 : import.meta.env.VITE_QUERY_OFFSET;
  const SORT = import.meta.env.DEV ? 'asc' : import.meta.env.VITE_QUERY_SORT;

  /**
   * Create a new indicator
   * @param input Indicator input without ID
   */
  const createIndicator = async (input: Omit<Indicator, 'id'>) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await $fetch<{ data: Indicator, error?: any }>('/api/indicators', {
        method: 'POST',
        body: input,
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to create indicator'
        });
        toast.error(fetchError?.statusMessage || 'Failed to create indicator');
        throw createError(fetchError?.statusMessage || 'Failed to create indicator');
      }

      indicators.value = [...(indicators.value || []), data];
      toast.success('Indicator created successfully');
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to create indicator';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update an existing indicator
   * @param id Indicator ID to update
   * @param input Partial indicator input
   */
  const updateIndicator = async (id: number, input: Partial<Indicator>) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await $fetch<{ data: Indicator, error?: any }>(`/api/indicators/${id}`, {
        method: 'PUT',
        body: input,
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to update indicator'
        });
        toast.error(fetchError?.statusMessage || 'Failed to update indicator');
        throw createError(fetchError?.statusMessage || 'Failed to update indicator');
      }

      indicators.value = indicators.value?.map(i =>
        i.id === id ? { ...i, ...data } : i
      ) || null;

      if (selectedIndicator.value?.id === id) {
        selectedIndicator.value = { ...selectedIndicator.value, ...input };
      }
      toast.success('Indicator updated successfully');
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to update indicator';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete an indicator
   * @param id Indicator ID to delete
   */
  const deleteIndicator = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: fetchError } = await $fetch<{ error?: any }>(`/api/indicators/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to delete indicator'
        });
        toast.error(fetchError?.statusMessage || 'Failed to delete indicator');
        throw createError(fetchError?.statusMessage || 'Failed to delete indicator');
      }

      indicators.value = indicators.value?.filter(i => i.id !== id) || null;
      if (selectedIndicator.value?.id === id) {
        resetSelectedIndicator();
      }
      toast.success('Indicator deleted successfully');
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to delete indicator';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch all indicators
   */
  const fetchIndicators = async () => {
    loading.value = true;
    error.value = null;

    try {
      const query = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: OFFSET.toString(),
        sort: SORT
      }).toString();
      const { data, error: fetchError } = await $fetch<{ data: Indicator[], error?: any }>(`/api/indicators?${query}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Failed to fetch indicators'
        });
        toast.error(fetchError?.statusMessage || 'Failed to fetch indicators');
        throw createError(fetchError?.statusMessage || 'Failed to fetch indicators');
      }

      indicators.value = data;
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch indicators';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch a single indicator by ID
   * @param id Indicator ID to fetch
   */
  const fetchIndicatorById = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await $fetch<{ data: Indicator, error?: any }>(`/api/indicators/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Indicator not found'
        });
        toast.error(fetchError?.statusMessage || 'Indicator not found');
        throw createError(fetchError?.statusMessage || 'Indicator not found');
      }

      selectedIndicator.value = data;
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch indicator';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  const resetSelectedIndicator = () => {
    selectedIndicator.value = null;
  };

  return {
    indicators,
    selectedIndicator,
    loading,
    error,
    createIndicator,
    updateIndicator,
    deleteIndicator,
    fetchIndicators,
    fetchIndicatorById,
    resetSelectedIndicator
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useIndicatorsStore, import.meta.hot));
}
