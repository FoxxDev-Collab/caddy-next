import CredentialsProvider from "next-auth/providers/credentials";
import type { User } from "next-auth";
import type { NextAuthOptions } from "next-auth";

// Default admin credentials - should be overridden by environment variables
const DEFAULT_ADMIN_USER = "admin";
const DEFAULT_ADMIN_PASS = "admin";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        // Get admin credentials from environment variables or use defaults
        const adminUser = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USER;
        const adminPass = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASS;

        // Check if credentials match
        if (
          credentials.username === adminUser &&
          credentials.password === adminPass
        ) {
          return {
            id: "1",
            name: adminUser,
            email: `${adminUser}@local.host`,
          };
        }

        throw new Error("Invalid credentials");
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
