import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt', // Use JWT instead of database sessions
  },
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
        // Add user role to session (can be stored in JWT)
        session.user.role = (token.role as UserRole) || UserRole.RESTAURANT_OWNER
      }
      return session
    },
    jwt: async ({ token, user }) => {
      // Store user info in JWT token
      if (user) {
        token.role = UserRole.RESTAURANT_OWNER // Default role
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === 'development',
}
