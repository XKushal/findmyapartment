import { type User } from "@prisma/client";

import {
  type LoginInput,
  type RegisterInput,
  type SafeUser,
  safeUserSchema,
} from "@/features/auth/schemas";
import { hashPassword, verifyPassword } from "@/features/auth/password";
import { emailAlreadyExists } from "@/server/api/errors";
import { prisma } from "@/server/db/prisma";

function toSafeUser(user: Pick<User, "id" | "email" | "name" | "image">): SafeUser {
  return safeUserSchema.parse({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  });
}

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw emailAlreadyExists(input.email);
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash: await hashPassword(input.password),
    },
  });

  return toSafeUser(user);
}

export async function validateCredentials(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user?.passwordHash) {
    return null;
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  return toSafeUser(user);
}
