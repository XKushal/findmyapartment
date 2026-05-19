import { auth } from "@/server/auth/auth";
import { authRequired } from "@/server/api/errors";

export type CurrentUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

export async function requireCurrentUser(): Promise<CurrentUser> {
  const session = await auth();

  if (!session?.user?.id) {
    throw authRequired();
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}
