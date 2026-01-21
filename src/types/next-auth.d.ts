import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: "ADMIN" | "MOD" | "USER";
    firstName?: string;
    lastName?: string;
    userName?: string;
    gender?: string;
    interests?: string[];
    plan?: string;
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MOD" | "USER";
      firstName?: string;
      lastName?: string;
      userName?: string;
      gender?: string;
      interests?: string[];
      plan?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "MOD" | "USER";
    firstName?: string;
    lastName?: string;
    userName?: string;
    gender?: string;
    interests?: string[];
    plan?: string;
  }
}
