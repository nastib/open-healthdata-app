import { defineStore } from 'pinia'
import type { AuthError, ProfileWithRoles, Role } from '~/types'
import { toast } from 'vue-sonner';

interface ProfileStore {
  profile: Ref<ProfileWithRoles | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  createProfile: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
  hasRole: (roleCode: string) => boolean
  hasAnyRole: (roleCodes: string[]) => boolean
}

export const useProfileStore = defineStore('profile', (): ProfileStore => {
  const profile = ref<ProfileWithRoles | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const { loadSession } = useSessionPersistence()

  /**
   * Fetch profile by userId
   * @param userId
   */
  const fetchProfile = async (userId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await $fetch<{data: ProfileWithRoles, error?: any}>(`/api/profile/${userId}`,{
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        },
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Profile not found'
        })
        toast.error(fetchError?.statusMessage || 'Profile not found');
        throw createError(fetchError?.statusMessage || 'Profile not found')
      }

      profile.value = data
      loading.value = false

    } catch (err: unknown) {
      const message = (err as AuthError)?.message || 'Failed to fetch profile'
      error.value = createError({ statusCode: 500, statusMessage: message})
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  /**
   * Create profile
   */
  const createProfile = async () => {
    loading.value = true
    error.value = null
    const authStore = useAuthStore()
    try {

      const { data, error: fetchError } = await $fetch<{data: ProfileWithRoles, error?: any}>(`/api/profile`,{
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' +  loadSession()?.tokens.access || ''
        },
        body: {
          userId: authStore.user?.id,
          email: authStore.user?.email,
          theme: 'dark',
          createdAt: new Date()
        }
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Unable to create profile'
        })
        toast.error(fetchError?.statusMessage || 'Unable to create profile');
        throw createError(fetchError?.statusMessage || 'Unable to create profile')
      }
      profile.value = data
      loading.value = false

    } catch (err: unknown) {
      const message = (err as AuthError)?.message || 'Failed to create profile'
      error.value = createError({ statusCode: 500, statusMessage: message})
      toast.error(message)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if user has a specific role
   * @param roleCode
   */
  const hasRole = (roleCode: string) => {
    if (!(profile.value as ProfileWithRoles)?.roles) return false
    return (profile.value as ProfileWithRoles).roles.some((role: Role) => role.code === roleCode)
  }

  /**
   * Check if user has any of the roles
   * @param roleCodes
   */
  const hasAnyRole = (roleCodes: string[]) => {
    if (!(profile.value as ProfileWithRoles)?.roles) return false

    return roleCodes.some(roleCode =>
      (profile.value as ProfileWithRoles)?.roles.some((role: Role) => role.code === roleCode)
    )
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createProfile,
    hasRole,
    hasAnyRole
  }
})



// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProfileStore, import.meta.hot))
}


