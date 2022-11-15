/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import "reflect-metadata";
import { ApolloServer } from "apollo-server";
 
import dataSource from './utils';

const port = 5000

const start = async (): Promise<void> => {
  await dataSource.initialize()
  const server = new ApolloServer({});

  try {
    const { url }: { url: string } = await server.listen({port});
    console.log(`Server is ready at ${url}`);
  } catch (err) {
    console.log("Error starting the server");
  }
}

void start();