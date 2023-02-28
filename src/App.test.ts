import { ApolloServer } from "apollo-server-express";
import IProps from "./types/IProps";

const typeDefs = `#graphql
  type Query {
    hello(name: String): String!
  }
`;

const resolvers = {
  Query: {
    hello: (_: any, { name }: IProps) => `Hello ${name}!`,
  },
};

it("returns hello with the provided name", async () => {
  const testServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const response = await testServer.executeOperation({
    query: "query SayHelloWorld($name: String) { hello(name: $name) }",
    variables: { name: "world" },
  });

  expect(response.errors).toBeUndefined();
  expect(response.data?.hello).toBe("Hello world!");
});
