import { ProfileServices } from '~/server/services/profile/index.service'
import type { ProfileWithRoles } from '~/server/schemas/profile.schema'
import prisma from '@/server/utils/prisma'

interface IPermissions {
  canCreate(profile: ProfileWithRoles): Promise<boolean>
  canUpdate(profile: ProfileWithRoles, dataSourceId: number): Promise<boolean>
  canDelete(profile: ProfileWithRoles, dataSourceId: number): Promise<boolean>
  canView(profile: ProfileWithRoles, dataSourceId: number): Promise<boolean>
  canViewAll(profile: ProfileWithRoles): Promise<boolean>
}

export class DataSourcePermissions implements IPermissions {
  async canCreate(profile: ProfileWithRoles): Promise<boolean> {
    const { hasRole } = new ProfileServices()
    return (await hasRole(profile, 'ADMIN')) || ((await hasRole(profile, 'CREATOR')) && !!profile.organizationElementCode)
  }

  async canUpdate(profile: ProfileWithRoles, dataSourceId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices()
    if (await hasRole(profile, 'ADMIN')) return true

    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
      include: { variables: true }
    })

    if (!dataSource) return false

    return true
  }

  async canDelete(profile: ProfileWithRoles, dataSourceId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices()
    if (!(await hasRole(profile, 'ADMIN'))) return false

    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
     })

    if (!dataSource) return false

    return true
  }

  async canView(profile: ProfileWithRoles, dataSourceId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices()

    if (!(await hasRole(profile, 'VIEWER')) && !(await hasRole(profile, 'CREATOR')) && !(await hasRole(profile, 'ADMIN'))) {
      return false
    }

    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
    })

    if (!dataSource) return false

    return (await hasRole(profile, 'ADMIN'))
  }

  async canViewAll(profile: ProfileWithRoles): Promise<boolean> {
    const { hasRole } = new ProfileServices()

    if (!(await hasRole(profile, 'VIEWER')) && !(await hasRole(profile, 'CREATOR')) && !(await hasRole(profile, 'ADMIN'))) {
      return false
    }

    return true
  }
}

export const dataSourcePermissions = {
  'create:data-source': 'Create new data sources',
  'read:data-source': 'View data sources',
  'update:data-source': 'Modify data sources',
  'delete:data-source': 'Remove data sources'
}
