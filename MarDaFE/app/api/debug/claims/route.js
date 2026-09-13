import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    const token = await getToken({ req, raw: false });
    const roles = token?.roles || [];
    const username = token?.username || token?.name;
    return new Response(
      JSON.stringify({ ok: true, username, id: token?.id, roles, token }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
