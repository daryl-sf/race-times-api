import { prisma } from "@/lib/prisma";
import { builder } from "@/schema/builder";
import { User } from "@prisma/client";
import { UserApi } from "../objects";

builder.queryFields((t) => ({
  me: t.prismaField({
    type: UserApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    resolve: (_query, _root, _args, context) => {
      return context.currentUser;
    }
  })
}));
