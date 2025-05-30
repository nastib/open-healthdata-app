import { createClient } from '@supabase/supabase-js';
import { H3Event } from 'h3';
import { ProfileWithRoles } from '@/server/schemas/profile.schema';
import { ProfileServices } from '@/server/services/profile/index.service';
import useSupabaseClient from '~/composables/useSupabase';
import { serverSupabaseUser } from '#supabase/server';

export interface IAuthUser {
  id: string;
  email?: string;
  profile: ProfileWithRoles;
}

export interface IAuthServer {
  getAuthenticatedUserFromCookie(event: H3Event): Promise<IAuthUser>;
  getAuthenticatedUserFromJWT(event: H3Event): Promise<IAuthUser>;
  getAuthenticatedUser(event: H3Event): Promise<IAuthUser>;
}
/**
 *  Resources authorization & permissions management
 */
export class AuthServer implements IAuthServer {
  /**
   * Retrieves the authenticated user from Supabase and their profile from Prisma.
   * If the user is not authenticated or does not have a profile, an error is thrown.
   * @param event
   * @returns Authenticated user with permissions
   */
  async getAuthenticatedUser(event: H3Event): Promise<IAuthUser> {
    const user = await serverSupabaseUser(event);

    if (!user) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Not authenticated',
      });
    }

    const { fetchProfileByUserId } = new ProfileServices();
    const { data: profile, error: profileError } = await fetchProfileByUserId(user.id);

    if (!profile || profileError) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - No profile found',
      });
    }

    return {
      id: profile.userId,
      email: profile.email,
      profile,
    } as IAuthUser;
  }

  /**
   * Get authenticated user from cookie
   * @param event
   * @returns
   */
  async getAuthenticatedUserFromCookie(event: H3Event): Promise<IAuthUser> {
    const cookies = parseCookies(event);
    const authCookie = cookies['sb-supabase-auth-token'];
    let cookieData: any = {};
    let token = '';

    if (!authCookie) {
      console.error('No auth cookie found');
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid auth',
      });
    }

    try {
      // Handle base64 encoded JSON cookie
      if (authCookie.startsWith('base64-')) {
        const base64Data = authCookie.substring(7); // Remove 'base64-' prefix
        const decodedCookie = Buffer.from(base64Data, 'base64').toString('utf8');
        cookieData = JSON.parse(decodedCookie);

        if (cookieData?.access_token) {
          token = cookieData.access_token;
          console.log('Extracted access token from base64 JSON cookie');
        } else {
          throw new Error('No access_token in decoded cookie');
        }
      }
      // Handle raw JWT token
      else if (authCookie.split('.').length === 3) {
        token = authCookie;
        console.log('Using raw JWT token from cookie');
      }
      // Handle plain JSON
      else {
        try {
          const cookieData = JSON.parse(authCookie);
          if (cookieData?.access_token) {
            token = cookieData.access_token;
            console.log('Extracted access token from JSON cookie');
          }
        } catch (jsonErr) {
          throw new Error('Invalid auth cookie format');
        }
      }
    } catch (err) {
      console.error('Auth cookie processing error:', err);
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid auth data',
      });
    }
    if (!token) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - No authenticated user found',
      });
    }

    const { fetchProfileByUserId } = new ProfileServices();

    const { data: profile, error: profileError } = await fetchProfileByUserId(cookieData.user.id);

    if (!profile || profileError) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - No profile found',
      });
    }

    return {
      id: cookieData.user.id,
      email: cookieData.user.email,
      profile,
    } as IAuthUser;
  }

  /**
   * Get authenticated user from JWT
   * @param event
   * @returns
   */
  async getAuthenticatedUserFromJWT(event: H3Event): Promise<IAuthUser> {
    const authHeader = getHeader(event, 'Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Missing or invalid Authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    if (!token || token.split('.').length !== 3) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid JWT format',
      });
    }

    // Verify token with Supabase
    const supabase = useSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid token',
      });
    }

    const { fetchProfileByUserId } = new ProfileServices();
    const { data: profile, error: profileError } = await fetchProfileByUserId(user.id);

    if (!profile || profileError) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - No profile found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      profile,
    } as IAuthUser;
  }
}
