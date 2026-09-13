import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "creds",
      credentials: {},
      async authorize(credentials) {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8082';
        // Use absolute URL on the server (Node fetch requires absolute URLs).
        // Use Next proxy path only on the client.
        const apiUrl = typeof window !== 'undefined' ? '/backend' : backendUrl;
        // console.log('NextAuth attempting to authenticate with backend:', backendUrl);
        // console.log('Credentials received:', { username: credentials?.username, hasPassword: !!credentials?.password });
        
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

          // console.log('Backend response status:', res.status);
          
          if (!res.ok) {
            let errorMessage = 'Authentication failed';
            try {
              const errorData = await res.json();
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
              // If response is not JSON, use status text
              errorMessage = res.statusText || errorMessage;
            }
            // console.error('Backend authentication failed:', res.status, errorMessage);
            throw new Error(errorMessage);
          }

          const user = await res.json();
          // console.log('Backend authentication successful:', { userId: user.id, username: user.username });

          if (user.error === "Unauthorized") {
            throw new Error("Invalid username or password");
          } else if (user) {
            return user;
          } else {
            throw new Error("Invalid response from authentication server");
          }
        } catch (error) {
          // console.error('NextAuth authorization error:', error);
          throw new Error(`Authentication failed: ${error.message}`);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Backend returns: { token, id, username, name, roles, permittedPages }
        // Store the JWT token as accessToken and preserve all user data including roles
        const roles = Array.isArray(user?.roles) ? user.roles : [];
        const permittedPages = Array.isArray(user?.permittedPages) ? user.permittedPages : [];
        const merged = { 
          ...token, 
          accessToken: user.token || user.accessToken,
          id: user.id,
          username: user.username,
          name: user.name,
          roles,
          permittedPages
        };
      //  console.log('[NextAuth][jwt] merged token for user', user?.username, 'roles:', roles, 'permittedPages:', permittedPages);
      //  console.log('[NextAuth][jwt] full user object:', user);
        return merged;
      }
      return token;
    },
    async session({ session, token }) {
      // Check if JWT token is expired
      const payload = token?.accessToken?.split?.(".")?.[1];
      const decodedJwt = payload
        ? JSON.parse(Buffer.from(payload, "base64").toString("utf8"))
        : null;

      if (decodedJwt?.exp * 1000 > Date.now()) {
        // Token is valid - copy all token data to session
        session = { ...token };
        session.isTokenExpierd = 0;
      } else {
        session.isTokenExpierd = 1;
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

      // console.log('[NextAuth][session] session for user:', {
      //   username: session?.username,
      //   id: session?.id,
      //   roles,
      //   permittedPages,
      //   isTokenExpierd: session?.isTokenExpierd,
      // });

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
