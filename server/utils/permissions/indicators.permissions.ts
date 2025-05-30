import type { ProfileWithRoles } from '~/server/schemas/profile.schema'

export class IndicatorPermissions {
  async canView(profile: ProfileWithRoles, indicatorId?: number): Promise<boolean> {
    // All authenticated users can view indicators
    return true
  }

  async canCreate(profile: ProfileWithRoles): Promise<boolean> {
    // Only admin users can create indicators
    return profile.roles.some(role => role.code === 'ADMIN')
  }

  async canUpdate(profile: ProfileWithRoles, indicatorId: number): Promise<boolean> {
    // Only admin users can update indicators
    return profile.roles.some(role => role.code === 'ADMIN')
  }

  async canDelete(profile: ProfileWithRoles, indicatorId: number): Promise<boolean> {
    // Only admin users can delete indicators
    return profile.roles.some(role => role.code === 'ADMIN')
  }
}
