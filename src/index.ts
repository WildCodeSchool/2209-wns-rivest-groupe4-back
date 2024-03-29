/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";
import jwt from "jsonwebtoken";

import { buildSchema } from "type-graphql";
import * as dotenv from "dotenv";
import dataSource from "./dataSource";
import UserResolver from "./resolvers/userResolver";
import ProjectResolver from "./resolvers/projectResolver";
import CompilateurResolver from "./resolvers/compilateurResolver";
import LikeResolver from "./resolvers/likeResolver";
import FileResolver from "./resolvers/fileResolver";
import FolderResolver from "./resolvers/folderResolver";
import ReportResolver from "./resolvers/reportResolver";
import CommentResolver from "./resolvers/commentResolver";
import SendinBlueResolver from "./resolvers/sendinblueResolver";

dotenv.config();

const port = process.env.SERVER_PORT ?? 5001;
const start = async (): Promise<void> => {
  await dataSource.initialize();
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      CompilateurResolver,
      ProjectResolver,
      LikeResolver,
      FileResolver,
      FolderResolver,
      ReportResolver,
      CommentResolver,
      SendinBlueResolver,
    ],
    authChecker: ({ context }) => {
      const { userFromToken: { email } = { email: null } } = context;
      if (email === null) return false;
      else return true;
    },
  });

  const server = new ApolloServer({
    cache: new InMemoryLRUCache(),
    schema,
    context: ({ req }) => {
      if (
        req.headers.authorization === undefined ||
        process.env.JWT_SECRET_KEY === undefined
      ) {
        return {};
      } else {
        try {
          let bearer = req.headers.authorization;
          if (bearer.includes("Bearer")) {
            const [string, token] = bearer.split("Bearer ");
            bearer = token;
          }
          if (bearer.length > 0) {
            const userFromToken = jwt.verify(
              bearer,
              process.env.JWT_SECRET_KEY,
            );
            return { userFromToken };
          } else {
            return {};
          }
        } catch (err) {
          console.error(err);
          return {};
        }
      }
    },
  });

  try {
    const { url }: { url: string } = await server.listen({ port });
    console.error(`Server is ready at ${url}`);
  } catch (err) {
    console.error("Error starting the server");
  }
};

void start();
