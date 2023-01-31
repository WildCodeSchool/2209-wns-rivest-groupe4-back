import { Arg, Mutation, Query, Resolver } from "type-graphql";

import dataSource from "../dataSource";
import File from "../entity/file";
import Folder from "../entity/folder";

@Resolver(File)
export default class FileResolver {
  @Query(() => [File])
  async getAllFiles() {
    const response = await dataSource.getRepository(File).find();
    console.warn(response);
    return await dataSource.getRepository(File).find();
  }

  @Mutation(() => String)
  async addFile(
    @Arg("name") name: string,
    @Arg("content") content: string,
    @Arg("extension") extension: string,
    @Arg("folderId") folderId: number,
  ): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const file = new File();
      file.folder = await dataSource.manager
        .getRepository(Folder)
        .findOneByOrFail({
          id: folderId,
        });
      file.name = name;
      file.content = content;
      file.extension = extension;

      await dataSource.manager.save(File, file);

      return `File saved`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }
}
