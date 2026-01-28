import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/hash";

export const authOptions: NextAuthOptions= {
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 *60 *60
    },
    providers: [
      CredentialsProvider({
        id: "credentials",
        name: "User Credentials",
        credentials: {
          phone: { label: "Phone", type: "tel" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.phone || !credentials?.password) {
            return null;
          }
  
          const user = await prisma.user.findUnique({
            where: { phone: credentials.phone },
          });
  
          if (!user) return null;
  
          const isValid = await verifyPassword(
            credentials.password,
            user.password
          );
  
          if (!isValid) return null;

          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });          
  
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.username ?? undefined,
            plan: user.planId ?? undefined,
            gender: user.gender ?? undefined,
            interests: user.interests ?? [],
            role: "USER",
          };          
        },
      }),
      CredentialsProvider({
        id: "mod-credentials",
        name: "Mod Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
  
          const user = await prisma.mod.findUnique({
            where: { email: credentials.email },
          });
  
          if (!user) return null;
  
          const isValid = await verifyPassword(
            credentials.password,
            user.password
          );
  
          if (!isValid) return null;
  
          return {
            id: user.id,
            email: user.email,
            role: "MOD"
          };
        },
      }),
      CredentialsProvider({
        id: "admin-credentials",
        name: "Admin Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
  
          const user = await prisma.admin.findUnique({
            where: { email: credentials.email },
          });
  
          if (!user) return null;
  
          const isValid = await verifyPassword(
            credentials.password,
            user.password
          );
  
          if (!isValid) return null;
  
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: "ADMIN"
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user.id
          token.role = user.role
          token.firstName = user.firstName
          token.lastName = user.lastName
          token.userName = user.userName
          token.gender = user.gender
          token.interests = user.interests
          token.plan = user.plan
        }

        if (trigger === "update" && session?.user) {
          token.firstName = session.user.firstName
          token.lastName = session.user.lastName
          token.userName = session.user.userName
          token.gender = session.user.gender
          token.interests = session.user.interests
          token.plan = session.user.plan
        }
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string
          session.user.role = token.role
          session.user.firstName = token.firstName as string
          session.user.lastName = token.lastName as string
          session.user.userName = token.userName as string
          session.user.gender = token.gender as string
          session.user.interests = token.interests as string[]
          session.user.plan = token.plan as string
        }
        return session
      }
      
    },
    events:{
      async signIn({user}) {
        if(user?.id && user.role==="MOD"){
          await prisma.mod.update({
            where: { id: user.id },
            data: { isActive: true}
          })
        }
      },
      async signOut({token}) {
        if(token?.id && token.role==="MOD"){
          await prisma.mod.update({
            where: { id: token.id },
            data: { isActive: false}
          })
        }
      }
    },
    pages: {
      signIn: "/signup",
    },
    secret: process.env.NEXTAUTH_SECRET,
  }