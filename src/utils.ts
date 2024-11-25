import { Context } from "hono";
import { getCookie } from "hono/cookie";

export function getUserIdFromCookie(c: Context) {
  return getCookie(c, "userId");
}
