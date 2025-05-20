//zod schemas off profile table
import { z } from "zod";
import { RoleSchema } from "./role.schema";

//describe zod schema using this type ProfileWithRoles

export const ProfileWithRolesSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().uuid(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  bio: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  roles: z.array(RoleSchema),
});

//generate zod schema of Profile
export const ProfileSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().uuid(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  bio: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProfileSchema = ProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProfileSchema = ProfileSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const ProfileUserIdSchema = z.string().uuid();

export const ProfileIdSchema = z.number().int().positive();

// export  type Profile = z.infer<typeof ProfileSchema>;
// export  type CreateProfile = z.infer<typeof CreateProfileSchema>;
// export  type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
// export  type ProfileUserId = z.infer<typeof ProfileUserIdSchema>;
//export type ProfileWithRoles = z.infer<typeof ProfileWithRolesSchema>;

