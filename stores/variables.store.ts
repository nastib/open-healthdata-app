import { defineStore } from 'pinia';
import { toast } from 'vue-sonner';
import type { Variable } from '@prisma/client';

interface VariablesStore {
  variables: Ref<Variable[] | null>;
  selectedVariable: Ref<Variable | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  createVariable: (input: Omit<Variable, 'id'>) => Promise<void>;
  updateVariable: (id: number, input: Partial<Variable>) => Promise<void>;
  deleteVariable: (id: number) => Promise<void>;
  fetchVariables: () => Promise<void>;
  fetchVariableById: (id: number) => Promise<void>;
  resetSelectedVariable: () => void;
}

export const useVariablesStore = defineStore('variables-store', (): VariablesStore => {
  const variables = ref<Variable[] | null>(null);
  const selectedVariable = ref<Variable | null>(null);
  const { loadSession } = useSessionPersistence();
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const LIMIT = import.meta.env.DEV ? 10 : import.meta.env.VITE_QUERY_LIMIT;
  const OFFSET = import.meta.env.DEV ? 0 : import.meta.env.VITE_QUERY_OFFSET;
  const SORT = import.meta.env.DEV ? 'asc' : import.meta.env.VITE_QUERY_SORT;

  /**
   * Fetch all variables
   */
  const fetchVariables = async () => {
    loading.value = true;
    error.value = null;

    try {
      const query = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: OFFSET.toString(),
        sort: SORT
      }).toString();
      const { data, error: fetchError } = await $fetch<{ data: Variable[], error?: any }>(`/api/variables?${query}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Failed to fetch variables'
        });
        toast.error(fetchError?.statusMessage || 'Failed to fetch variables');
        throw createError(fetchError?.statusMessage || 'Failed to fetch variables');
      }

      variables.value = data;
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch variables';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a new variable
   * @param input Variable input without ID
   */
  const createVariable = async (input: Omit<Variable, 'id'>) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await $fetch<{ data: Variable, error?: any }>('/api/variables', {
        method: 'POST',
        body: input,
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to create variable'
        });
        toast.error(fetchError?.statusMessage || 'Failed to create variable');
        throw createError(fetchError?.statusMessage || 'Failed to create variable');
      }

      variables.value = [...(variables.value || []), data];
      toast.success('Variable created successfully');
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to create variable';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update an existing variable
   * @param id Variable ID to update
   * @param input Partial variable input
   */
  const updateVariable = async (id: number, input: Partial<Variable>) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await $fetch<{ data: Variable, error?: any }>(`/api/variables/${id}`, {
        method: 'PUT',
        body: input,
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to update variable'
        });
        toast.error(fetchError?.statusMessage || 'Failed to update variable');
        throw createError(fetchError?.statusMessage || 'Failed to update variable');
      }

      variables.value = variables.value?.map(v =>
        v.id === id ? { ...v, ...data } : v
      ) || null;

      if (selectedVariable.value?.id === id) {
        selectedVariable.value = { ...selectedVariable.value, ...input };
      }
      toast.success('Variable updated successfully');
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to update variable';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a variable
   * @param id Variable ID to delete
   */
  const deleteVariable = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const { error: fetchError } = await $fetch<{ error?: any }>(`/api/variables/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 400,
          statusMessage: fetchError?.statusMessage || 'Failed to delete variable'
        });
        toast.error(fetchError?.statusMessage || 'Failed to delete variable');
        throw createError(fetchError?.statusMessage || 'Failed to delete variable');
      }

      variables.value = variables.value?.filter(v => v.id !== id) || null;
      if (selectedVariable.value?.id === id) {
        resetSelectedVariable();
      }
      toast.success('Variable deleted successfully');
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to delete variable';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch a single variable by ID
   * @param id Variable ID to fetch
   */
  const fetchVariableById = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await $fetch<{ data: Variable, error?: any }>(`/api/variables/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + loadSession()?.tokens.access || ''
        }
      });

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Variable not found'
        });
        toast.error(fetchError?.statusMessage || 'Variable not found');
        throw createError(fetchError?.statusMessage || 'Variable not found');
      }

      selectedVariable.value = data;
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Failed to fetch variable';
      error.value = createError({ statusCode: 500, statusMessage: message });
      toast.error(message);
      throw message;
    } finally {
      loading.value = false;
    }
  };

  const resetSelectedVariable = () => {
    selectedVariable.value = null;
  };

  return {
    variables,
    selectedVariable,
    loading,
    error,
    fetchVariables,
    createVariable,
    updateVariable,
    deleteVariable,
    fetchVariableById,
    resetSelectedVariable
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useVariablesStore, import.meta.hot));
}
