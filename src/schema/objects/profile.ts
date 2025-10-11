import { builder } from "@/schema/builder";

export const ProfileApi = builder.prismaNode('Profile', {
  id: { field: 'id' },
  fields: (t) => ({
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName'),
    displayName: t.string({
      description: "Display name - first and last name joined",
      resolve: ({ firstName, lastName }) => (
        `${firstName} ${lastName}`
      )
    }),
    bio: t.exposeString('bio', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
});
