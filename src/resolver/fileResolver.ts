import { Arg, Mutation, Query, Resolver } from "type-graphql";

import dataSource from "../dataSource";
import File from "../entity/file";
import Folder from "../entity/folder";

@Resolver(File)
export default class FileResolver {
  @Query(() => [File])
  async getAllFiles() {
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

  @Mutation(() => String)
  async modifyFile(
    @Arg("idFile") idFile: number,
    @Arg("name", { nullable: true }) name?: string,
    @Arg("content", { nullable: true }) content?: string,
    @Arg("extension", { nullable: true }) extension?: string,
  ): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }
      const fileToRename = await dataSource.manager
        .getRepository(File)
        .findOneByOrFail({
          id: idFile,
        });

      if (name != null) {
        fileToRename.name = name;
      }
      if (content != null) {
        fileToRename.content = content;
      }
      if (extension != null) {
        fileToRename.extension = extension;
      }

      await dataSource.manager.save(File, fileToRename);

      return `File modified with success`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }

  @Mutation(() => String)
  async deleteFile(@Arg("fileId") fileId: number): Promise<string> {
    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new Error();
    }

    const fileToRemove = await dataSource.manager
      .getRepository(File)
      .findOneByOrFail({
        id: fileId,
      });

    try {
      await dataSource.manager.getRepository(File).remove(fileToRemove);
      return `File deleted`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }
}
