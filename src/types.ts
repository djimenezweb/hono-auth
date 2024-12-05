import { Prisma } from '@prisma/client';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  username: z.string().trim().min(1),
  password: z.string().trim().min(1),
});

const userFormSchema = userSchema.omit({ id: true });

export type User = z.infer<typeof userSchema>;

const userWithSessions = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { sessions: true },
});

export type UserWithSessions = Prisma.UserGetPayload<typeof userWithSessions>;

export type UserPayload = {
  userId: string;
  username: string;
  roles: string;
  sessionId: string;
};

export type AccessTokenPayload = UserPayload;

export type RefreshTokenPayload = {
  sessionId: string;
  exp: number;
};

export { userSchema, userFormSchema };
