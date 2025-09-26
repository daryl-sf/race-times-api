import { builder } from "@/schema/builder";
import { UserApi } from "../objects";

builder.queryFields((t) => ({
  me: t.prismaField({
    type: UserApi,
    authScopes: { isAuthenticated: true },
    nullable: true,
    resolve: (_query, _root, _args, { currentUser }) => {
      return currentUser;
    }
  })
}));
