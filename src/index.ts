import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';
import { schema } from '@/schema';
import { createContext } from './context';

// Create Yoga instance
const yoga = createYoga({
  schema,
  logging: true,
  maskedErrors: false,
  context: createContext,
});

// Create and start server
const server = createServer(yoga);

const port = process.env.PORT ?? 4000;

server.listen(port, () => {
  console.log(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
});
