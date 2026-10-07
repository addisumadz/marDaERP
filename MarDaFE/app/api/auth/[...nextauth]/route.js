import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(token) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:9092";
    const apiUrl = typeof window !== "undefined" ? "/backend" : backendUrl;

    const res = await fetch(`${apiUrl}/api/auth/refreshtoken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const refreshedTokens = await res.json();

    if (!res.ok) {
      throw refreshedTokens;
    }

    const newAccessToken = refreshedTokens.accessToken || refreshedTokens.token;
    let newExpires = Date.now() + 2 * 60 * 60 * 1000;
    try {
      const payload = newAccessToken?.split?.(".")?.[1];
      if (payload) {
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const pad = base64.length % 4;
        const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;
        const decoded = JSON.parse(Buffer.from(paddedBase64, "base64").toString("utf8"));
        if (decoded.exp) newExpires = decoded.exp * 1000;
      }
    } catch (_) {}

    return {
      ...token,
      accessToken: newAccessToken,
      refreshToken: refreshedTokens.refreshToken || token.refreshToken,
      accessTokenExpires: newExpires,
      isTokenExpired: 0,
      isTokenExpierd: 0,
      error: null,
    };
  } catch (error) {
    console.error("[NextAuth][jwt] RefreshAccessToken error:", error);
    return {
      ...token,
      isTokenExpired: 1,
      isTokenExpierd: 1,
      error: "RefreshAccessTokenError",
    };
  }
}

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "creds",
      credentials: {},
      async authorize(credentials) {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:9092';
        // Use absolute URL on the server (Node fetch requires absolute URLs).
        // Use Next proxy path only on the client.
        const apiUrl = typeof window !== 'undefined' ? '/backend' : backendUrl;
        
        try {
          const res = await fetch(`${apiUrl}/api/auth/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
          });
          
          if (!res.ok) {
            let errorMessage = 'Authentication failed';
            try {
              const errorData = await res.json();
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
              errorMessage = res.statusText || errorMessage;
            }
            throw new Error(errorMessage);
          }

          const user = await res.json();

          if (user.error === "Unauthorized") {
            throw new Error("Invalid username or password");
          } else if (user) {
            return user;
          } else {
            throw new Error("Invalid response from authentication server");
          }
        } catch (error) {
          throw new Error(`Authentication failed: ${error.message}`);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Backend returns: { token, refreshToken, id, username, name, roles, permittedPages }
        const roles = Array.isArray(user?.roles) ? user.roles : [];
        const permittedPages = Array.isArray(user?.permittedPages) ? user.permittedPages : [];
        const accessToken = user.token || user.accessToken;
        let accessTokenExpires = Date.now() + 2 * 60 * 60 * 1000;
        try {
          const payload = accessToken?.split?.(".")?.[1];
          if (payload) {
            const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            const pad = base64.length % 4;
            const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;
            const decoded = JSON.parse(Buffer.from(paddedBase64, "base64").toString("utf8"));
            if (decoded.exp) accessTokenExpires = decoded.exp * 1000;
          }
        } catch (_) {}

        return { 
          ...token, 
          accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires,
          id: user.id,
          username: user.username,
          name: user.name,
          roles,
          permittedPages,
          isTokenExpired: 0,
          isTokenExpierd: 0,
          error: null,
        };
      }

      // Return existing token if it has more than 2 minutes of validity remaining
      if (Date.now() < (token.accessTokenExpires || 0) - 2 * 60 * 1000) {
        return token;
      }

      // Token is nearing expiration or expired — trigger sliding refresh
      if (token.refreshToken) {
        return await refreshAccessToken(token);
      }

      return {
        ...token,
        isTokenExpired: 1,
        isTokenExpierd: 1,
        error: "AccessTokenExpired",
      };
    },
    async session({ session, token }) {
      // Safely decode and check if JWT token is expired
      let decodedJwt = null;
      try {
        const payload = token?.accessToken?.split?.(".")?.[1];
        if (payload) {
          const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
          const pad = base64.length % 4;
          const paddedBase64 = pad ? base64 + "=".repeat(4 - pad) : base64;
          decodedJwt = JSON.parse(Buffer.from(paddedBase64, "base64").toString("utf8"));
        }
      } catch (e) {
        console.error("[NextAuth][session] Error decoding JWT token payload:", e.message);
      }

      const isExpired =
        token.error === "RefreshAccessTokenError" ||
        token.error === "AccessTokenExpired" ||
        token.isTokenExpired === 1 ||
        (!decodedJwt?.exp ? false : decodedJwt.exp * 1000 <= Date.now());

      session = { ...token };
      if (!isExpired) {
        session.isTokenExpired = 0;
        session.isTokenExpierd = 0; // backward compatibility
        session.error = null;
      } else {
        session.isTokenExpired = 1;
        session.isTokenExpierd = 1; // backward compatibility
        session.error = "AccessTokenExpired";
      }

      // Ensure roles are available in session.user and at session level for middleware
      const roles = Array.isArray(token?.roles) ? token.roles : [];
      const permittedPages = Array.isArray(token?.permittedPages) ? token.permittedPages : [];
      session.user = session.user || {};
      session.user.roles = roles;
      session.user.permittedPages = permittedPages;
      session.roles = roles; // For middleware access
      session.permittedPages = permittedPages; // For middleware access
      session.user.role = roles[0] ?? undefined;
      session.refreshToken = token.refreshToken;

      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/api/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
