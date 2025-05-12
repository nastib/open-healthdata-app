//generate role zod schema
import { z } from "zod";

export const RoleSchema = z.object({
  id: z.number().int().positive(),
  code: z.string(),
  description: z.string().optional(),
});

// export const UserSchema = z.object({
//   name: z.string(),
//   email: z.string().email(),
//   password: z.string().min(8),
//   role: RoleSchema,
// });

//export type User = z.infer<typeof UserSchema>;
//export type Role = z.infer<typeof RoleSchema>;
