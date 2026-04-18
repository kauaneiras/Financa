import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-secret',
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || 'mock-azure-client-id',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || 'mock-azure-secret',
      tenantId: process.env.AZURE_AD_TENANT_ID || 'common',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || 'finhub-super-secret-key-2026',
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
