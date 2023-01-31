import { Arg, Mutation, Query, Resolver } from "type-graphql";

import dataSource from "../dataSource";
import File from "../entity/file";
import Folder from "../entity/folder";
import Project from "../entity/project";

@Resolver(Folder)
export default class FolderResolver {
  @Query(() => [Folder])
  async getAllFolders() {
    const response = await dataSource.getRepository(Folder).find();
    console.warn(response);
    return await dataSource
      .getRepository(Folder)
      .find({ relations: { parentFolder: true } });
  }

  @Mutation(() => String)
  async addFolder(
    @Arg("name") name: string,
    @Arg("projectId") projectId: number,
    @Arg("parentFolderId", { nullable: true }) parentFolderId?: number,
  ): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const folder = new Folder();
      folder.project = await dataSource.manager
        .getRepository(Project)
        .findOneByOrFail({
          id: projectId,
        });
      folder.name = name;

      if (parentFolderId != null) {
        folder.parentFolder = await dataSource.manager
          .getRepository(Folder)
          .findOneByOrFail({
            id: parentFolderId,
          });
      }

      await dataSource.manager.save(Folder, folder);

      return `Folder saved`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }
}
