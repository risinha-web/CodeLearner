import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { prisma } from "./db";

export const auth0 = new Auth0Client({
  signInReturnToPath: "/dashboard",
  async onCallback(error, ctx, session) {
    if (error) {
      console.error("Auth0 callback error:", error);
      return NextResponse.redirect(new URL("/", ctx.appBaseUrl ?? "http://localhost:3000"));
    }
    if (session?.user) {
      const { sub, email, name, picture } = session.user;
      await prisma.user.upsert({
        where: { auth0Id: sub },
        create: {
          auth0Id: sub,
          email: email ?? "",
          name: name ?? null,
          avatarUrl: picture ?? null,
        },
        update: {
          email: email ?? undefined,
          name: name ?? undefined,
          avatarUrl: picture ?? undefined,
        },
      });
    }
    const returnTo = ctx.returnTo ?? "/dashboard";
    return NextResponse.redirect(new URL(returnTo, ctx.appBaseUrl ?? "http://localhost:3000"));
  },
});
