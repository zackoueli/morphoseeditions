import { getClientAuth } from "@/lib/firebase/client";

export async function adminFetch(input: string, init: RequestInit = {}) {
  const user = getClientAuth().currentUser;
  if (!user) throw new Error("not_authenticated");
  const idToken = await user.getIdToken();
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${idToken}`,
    },
  });
}
