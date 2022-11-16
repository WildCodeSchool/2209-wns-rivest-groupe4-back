/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import "reflect-metadata";
import { ApolloServer } from "apollo-server";
 
import dataSource from './utils';
import { buildSchema } from 'type-graphql';
import { SampleResolver } from './resolver/SampleResolver';

const port = 5001
const start = async (): Promise<void> => {
  await dataSource.initialize()
  const schema = await buildSchema({
    resolvers: [SampleResolver]
  })
  const server = new ApolloServer({ schema });

  try {
    const { url }: { url: string } = await server.listen({port});
    console.log(`Server is ready at ${url}`);
  } catch (err) {
    console.log("Error starting the server");
  }
}

void start();