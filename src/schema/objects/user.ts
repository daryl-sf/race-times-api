import { builder } from "@/schema/builder";
import { User } from "@prisma/client";
import { ProfileApi } from "./profile";

export const UserApi = builder.prismaNode('User', {
  variant: "User",
  id: { field: "id" },
  fields: (t) => ({
    email: t.exposeString('email'),
    name: t.exposeString('name', { nullable: true }),
    profile: t.relation('profile', { type: ProfileApi, nullable: true }),
    isAdmin: t.exposeBoolean('isAdmin'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
});

export const AuthPayload = builder.simpleObject("AuthPayload", {
  fields: (t) => ({
    user: t.field({ type: UserApi }),
    token: t.string(),
  }),
});
