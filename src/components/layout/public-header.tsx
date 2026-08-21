import { getCurrentUser, roleHomePath } from "@/lib/auth/session";
import { PublicHeaderClient } from "./public-header-client";

export async function PublicHeader() {
  const user = await getCurrentUser();

  return (
    <PublicHeaderClient
      auth={user ? { loggedIn: true, dashboardHref: roleHomePath(user.role) } : { loggedIn: false }}
    />
  );
}
