/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import jwt from "jsonwebtoken";

import { buildSchema } from "type-graphql";
import * as dotenv from "dotenv";
import dataSource from "./dataSource";
import UserResolver from "./resolver/userResolver";
import ProjectResolver from "./resolver/projectResolver";
import CompilateurResolver from "./resolver/compilateurResolver";
import LikeResolver from "./resolver/likeResolver";
import FileResolver from "./resolver/fileResolver";
import FolderResolver from "./resolver/folderResolver";
import ReportResolver from "./resolver/reportResolver";
import CommentResolver from "./resolver/commentResolver";

dotenv.config();

const port = process.env.GITHUB_AUTH_TOKEN ?? 5001;
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
    ],
    authChecker: ({ context }, roles) => {
      if (context.email === undefined) {
        return false;
      } else {
        return true;
      }
    },
  });

  const server = new ApolloServer({
    schema,
    context: ({ req }) => {
      if (
        req.headers.authorization === undefined ||
        process.env.JWT_SECRET_KEY === undefined
      ) {
        return {};
      } else {
        try {
          const bearer = req.headers.authorization.split("Bearer ")[1];
          if (bearer && bearer.length > 0) {
            const user = jwt.verify(bearer, process.env.JWT_SECRET_KEY);
            return user;
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
