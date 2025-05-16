interface IPermissions {
  // Data category permissions
  canCreateDataCategory(user: IAuthUser): Promise<boolean>
  canUpdateDataCategory(user: IAuthUser, categoryId: number): Promise<boolean>
  canDeleteDataCategory(user: IAuthUser, categoryId: number): Promise<boolean>
  canViewDataCategory(user: IAuthUser, categoryId: number): Promise<boolean>

  // Data Entry permissions
  canCreateDataEntry(user: IAuthUser): Promise<boolean>
  canUpdateDataEntry(user: IAuthUser, entryId: number): Promise<boolean>
  canDeleteDataEntry(user: IAuthUser, entryId: number): Promise<boolean>
  canViewDataEntry(user: IAuthUser, entryId: number): Promise<boolean>
}

/**
* Permissions Class for granular access control
*/
export class Permissions implements IPermissions {

/////////////////////////////////////////////////
// Data Category permissions
/////////////////////////////////////////////////
  /**
   * Checks if user can view a specific data entry
   * @param user - Authenticated user
   * @param entryId - ID of entry to view
   * @returns boolean - true if user has any data role and org access
   */
  async canViewDataEntry(user: IAuthUser, entryId: number): Promise<boolean> {
    if (!user.hasRole('DATA_VIEWER') &&
        !user.hasRole('DATA_CREATOR') &&
        !user.hasRole('DATA_ADMIN')) {
      return false
    }

    const entry = await prisma.dataEntry.findUnique({
      where: { id: entryId }
    })

    if (!entry) return false

    // Allow view if user is admin or has org access
    return user.hasRole('DATA_ADMIN') ||
           entry.organizationElementCode === user.profile.organizationElementCode
  }
  /**
   * Checks if user can create data categories
   * @param user - Authenticated user
   * @returns boolean - true if user has DATA_ADMIN role or is organization data manager
   */
  async canCreateDataCategory(user: IAuthUser): Promise<boolean> {
    return user.hasRole('DATA_ADMIN') ||
           (user.hasRole('DATA_CREATOR') &&
           !!user.profile.organizationElementCode)
  }

  /**
   * Checks if user can update a specific data category
   * @param user - Authenticated user
   * @param categoryId - ID of category to update
   * @returns boolean - true if user has DATA_ADMIN role or owns the category
   */
  async canUpdateDataCategory(user: IAuthUser, categoryId: number): Promise<boolean> {
    if (user.hasRole('DATA_ADMIN')) return true

    const category = await prisma.dataCategory.findUnique({
      where: { id: categoryId },
      include: { dataEntries: true }
    })

    if (!category) return false

    // Check if user's org has entries in this category
    return category.dataEntries.some(entry =>
      entry.organizationElementCode === user.profile.organizationElementCode
    )
  }

  /**
   * Checks if user can delete a specific data category
   * @param user - Authenticated user
   * @param categoryId - ID of category to delete
   * @returns boolean - true if user has DATA_ADMIN role and category is empty
   */
  async canDeleteDataCategory(user: IAuthUser, categoryId: number): Promise<boolean> {
    if (!user.hasRole('DATA_ADMIN')) return false

    const category = await prisma.dataCategory.findUnique({
      where: { id: categoryId },
      include: {
        dataEntries: true,
        indicators: true,
        variables: true
      }
    })

    if (!category) return false

    // Only allow deletion if category has no associated data
    return category.dataEntries.length === 0 &&
           category.indicators.length === 0 &&
           category.variables.length === 0
  }

  /**
   * Checks if user can view a specific data category
   * @param user - Authenticated user
   * @param categoryId - ID of category to view
   * @returns boolean - true if user has any data role and org access
   */
  async canViewDataCategory(user: IAuthUser, categoryId: number): Promise<boolean> {
    if (!user.hasRole('DATA_VIEWER') &&
        !user.hasRole('DATA_CREATOR') &&
        !user.hasRole('DATA_ADMIN')) {
      return false
    }

    const category = await prisma.dataCategory.findUnique({
      where: { id: categoryId },
      include: { dataEntries: true }
    })

    if (!category) return false

    // Allow view if user is admin or has org access
    return user.hasRole('DATA_ADMIN') ||
           category.dataEntries.some(entry =>
             entry.organizationElementCode === user.profile.organizationElementCode
           )
  }

/////////////////////////////////////////////////
// Data Entry permissions
/////////////////////////////////////////////////

  /**
   * Checks if user can create data entries
   * @param user - Authenticated user
   * @returns boolean - true if user has DATA_ADMIN or DATA_CREATOR role with org access
   */
  async canCreateDataEntry(user: IAuthUser): Promise<boolean> {
    return user.hasRole('DATA_ADMIN') ||
           (user.hasRole('DATA_CREATOR') &&
           !!user.profile.organizationElementCode)
  }

  /**
   * Checks if user can update a specific data entry
   * @param user - Authenticated user
   * @param entryId - ID of entry to update
   * @returns boolean - true if user has DATA_ADMIN role or owns the entry
   */
  async canUpdateDataEntry(user: IAuthUser, entryId: number): Promise<boolean> {
    if (user.hasRole('DATA_ADMIN')) return true

    const entry = await prisma.dataEntry.findUnique({
      where: { id: entryId }
    })

    if (!entry) return false

    // Check if user's org owns this entry
    return entry.organizationElementCode === user.profile.organizationElementCode
  }

  /**
   * Checks if user can delete a specific data entry
   * @param user - Authenticated user
   * @param entryId - ID of entry to delete
   * @returns boolean - true if user has DATA_ADMIN role or owns the entry
   */
  async canDeleteDataEntry(user: IAuthUser, entryId: number): Promise<boolean> {
    if (user.hasRole('DATA_ADMIN')) return true

    const entry = await prisma.dataEntry.findUnique({
      where: { id: entryId }
    })

    if (!entry) return false

    // Check if user's org owns this entry
    return entry.organizationElementCode === user.profile.organizationElementCode
  }
}
