import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Twitter from "next-auth/providers/twitter"
import GitHub from "next-auth/providers/github"
import Entra from "next-auth/providers/microsoft-entra-id";

export const { handlers, signIn, signOut, auth } = NextAuth({
  theme:{
    colorScheme: 'light',
    logo: '/eoh.png',
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    Google,
    Twitter,
    GitHub,
    Entra({
      clientId: process.env.AUTH_AZURE_AD_ID,
      clientSecret: process.env.AUTH_AZURE_AD_SECRET,
      tenantId: process.env.AUTH_AZURE_AD_TENANT,
    })
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});