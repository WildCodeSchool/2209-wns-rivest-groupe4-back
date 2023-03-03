import { Arg, Mutation, Query, Resolver } from "type-graphql";

import dataSource from "../dataSource";
import Folder from "../entities/folder";
import Project from "../entities/project";

@Resolver(Folder)
export default class FolderResolver {
  @Query(() => [Folder])
  async getAllFolders() {
    return await dataSource
      .getRepository(Folder)
      .find({ relations: { parentFolder: true, project: true } });
  }

  @Query(() => [Folder])
  async getAllFoldersByProjectId(@Arg("idProject") idProject: number) {
    const response = await dataSource.getRepository(Folder).find({
      where: { project: { id: idProject } },
      relations: { files: true, parentFolder: true },
    });
    return response;
  }

  @Mutation(() => String)
  async addFolder(
    @Arg("name") name: string,
    @Arg("projectId") projectId: number,
    @Arg("parentFolderId") parentFolderId: number,
  ): Promise<string> {
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

    folder.parentFolder = await dataSource.manager
      .getRepository(Folder)
      .findOneByOrFail({
        id: parentFolderId,
      });

    try {
      await dataSource.manager.save(Folder, folder);
      return `Folder saved`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }

  @Mutation(() => Folder)
  async modifyFolder(
    @Arg("folderId") folderId: number,
    @Arg("name", { nullable: true }) name?: string,
    @Arg("parentFolderId", { nullable: true }) parentFolderId?: number,
  ): Promise<Folder> {
    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new Error();
    }

    const folderToModify = await dataSource.manager
      .getRepository(Folder)
      .findOneByOrFail({
        id: folderId,
      });

    if (name != null) {
      folderToModify.name = name;
    }

    if (parentFolderId != null) {
      folderToModify.parentFolder = await dataSource.manager
        .getRepository(Folder)
        .findOneByOrFail({
          id: parentFolderId,
        });
    }
    console.warn(folderToModify);

    try {
      await dataSource.manager.save(Folder, folderToModify);
      return folderToModify;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }

  @Mutation(() => String)
  async deleteFolder(@Arg("folderId") folderId: number): Promise<string> {
    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new Error();
    }

    const folderToRemove = await dataSource.manager
      .getRepository(Folder)
      .findOneByOrFail({
        id: folderId,
      });

    try {
      await dataSource.manager.getRepository(Folder).remove(folderToRemove);
      return `Folder deleted`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }
}
