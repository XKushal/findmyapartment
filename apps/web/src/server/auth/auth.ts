import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginBodySchema } from "@/features/auth/schemas";
import { validateCredentials } from "@/features/auth/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginBodySchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        return validateCredentials(parsed.data);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});
