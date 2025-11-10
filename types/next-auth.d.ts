import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "SEEKER" | "EMPLOYER"
    }
  }

  interface User {
    role: "SEEKER" | "EMPLOYER"
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "SEEKER" | "EMPLOYER"
    id: string
  }
}

