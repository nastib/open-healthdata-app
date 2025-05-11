import { ProfileServices } from '~/server/services/profile/index.service'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id

  if (!id) {
    return { data: null, error: {
      statusCode: 400,
      statusMessage: 'Missing profile ID'
    } };

  }

  try {
    const { data, error } = await ProfileServices.getProfileById(id )
    return { data, error }

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch profile'
    })
  }
})
