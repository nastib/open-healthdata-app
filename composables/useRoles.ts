import { useProfileStore } from '@/stores/profile.store'
import type { ProfileWithRoles } from '@/types'

export const useRoles = () => {
  const profileStore = useProfileStore()

  const hasRole = (roleCode: string) => {
    return profileStore.hasRole(roleCode)
  }

  const hasAnyRole = (roleCodes: string[]) => {
    return profileStore.hasAnyRole(roleCodes)
  }

  const hasAllRoles = (requiredRoleCodes: string[]) => {
    if (!(profileStore.profile as ProfileWithRoles)?.roles) return false
    return requiredRoleCodes.every(requiredCode =>
      (profileStore.profile as ProfileWithRoles)?.roles?.some(role => role.code === requiredCode)
    )
  }

  return {
    hasRole,
    hasAnyRole,
    hasAllRoles
  }
}
