import SchemaBuilder from '@pothos/core';
import { DateTimeResolver } from "graphql-scalars";
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import { prisma } from '@/lib/prisma';
import { Context } from '@/context';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import RelayPlugin from '@pothos/plugin-relay';
import ErrorsPlugin from '@pothos/plugin-errors';
import ValidationPlugin from '@pothos/plugin-validation';
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects';

export interface SchemaBuilderTypes {
  Scalars: {
    DateTime: { Input: Date; Output: Date };
  };
  Context: Context;
  PrismaTypes: PrismaTypes;
  AuthScopes: {
    isAdmin: boolean;
    isAuthenticated: boolean;
  }
}

export const builder = new SchemaBuilder<SchemaBuilderTypes>({
  plugins: [SimpleObjectsPlugin, ErrorsPlugin, RelayPlugin, ValidationPlugin, ScopeAuthPlugin, PrismaPlugin],
  prisma: {
    client: prisma,
  },
  scopeAuth: {
    // Recommended when using subscriptions
    // when this is not set, auth checks are run when event is resolved rather than when the subscription is created
    authorizeOnSubscribe: true,
    authScopes: async (context) => ({
      isAdmin: context.currentUser?.isAdmin ?? false,
      isAuthenticated: !!context.currentUser,
    }),
  },
  relay: {
    nodeQueryOptions: false,
    nodesQueryOptions: false,
    clientMutationId: 'omit',
  },
  errors: {
    defaultTypes: [Error],
  }
});

builder.queryType({});

builder.mutationType({});

builder.addScalarType('DateTime', DateTimeResolver, {});
