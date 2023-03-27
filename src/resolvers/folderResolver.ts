import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import dataSource from "../dataSource";
import Folder from "../entities/folder";
import Project from "../entities/project";

@Resolver(Folder)
export default class FolderResolver {
  @Authorized()
  @Query(() => [Folder])
  async getAllFoldersByProjectId(@Arg("idProject") idProject: number) {
    const project = await dataSource
      .getRepository(Project)
      .findOneBy({ id: idProject });
    if (project === null) {
      throw new Error("No project found with this idProject");
    }
    const response = await dataSource.getRepository(Folder).find({
      where: { project: { id: idProject } },
      relations: { files: true, parentFolder: true },
    });
    return response;
  }

  @Authorized()
  @Mutation(() => Folder)
  async addFolder(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("name") name: string,
    @Arg("parentFolderId") parentFolderId: number,
  ): Promise<Folder> {
    const {
      userFromToken: { userId },
    } = context;

    const parentFolder = await dataSource.getRepository(Folder).findOne({
      where: { id: parentFolderId },
      relations: { project: { user: true } },
    });

    if (name === "") {
      throw new Error("No empty folder name");
    }

    if (parentFolder === null) {
      throw new Error("No folder found with this parentFolderId");
    }

    if (parentFolder.project.user.id !== userId) {
      throw new Error("This user isn't the owner of the folder/project");
    }

    const folderWithSameName = await dataSource.getRepository(Folder).findOne({
      where: { parentFolder: { id: parentFolderId }, name },
    });

    if (folderWithSameName != null) {
      throw new Error(
        "Folder with same name and same parentFolder already exists",
      );
    }

    const folder = new Folder();
    folder.project = parentFolder.project;
    folder.name = name;
    folder.parentFolder = parentFolder;

    try {
      const folderInDB = await dataSource.manager.save(Folder, folder);
      return folderInDB;
    } catch (error) {
      throw new Error("Error while saving folder");
    }
  }

  @Authorized()
  @Mutation(() => Folder)
  async renameFolder(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("folderId") folderId: number,
    @Arg("name", { nullable: true }) name?: string,
  ): Promise<Folder> {
    const {
      userFromToken: { userId },
    } = context;

    const folderToModify = await dataSource.getRepository(Folder).findOne({
      where: { id: folderId },
      relations: { project: { user: true } },
    });

    if (name === "") {
      throw new Error("No empty folder name");
    }

    if (folderToModify === null) {
      throw new Error("No folder found with this folderId");
    }

    if (folderToModify.project.user.id !== userId) {
      throw new Error("This user isn't the owner of the folder/project");
    }

    if (name != null) {
      folderToModify.name = name;
    }

    try {
      await dataSource.manager.save(Folder, folderToModify);
      return folderToModify;
    } catch (error) {
      throw new Error("Error while renaming folder");
    }
  }

  @Authorized()
  @Mutation(() => String)
  async deleteFolder(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("folderId") folderId: number,
  ): Promise<string> {
    const {
      userFromToken: { userId },
    } = context;

    const folderToDelete = await dataSource.getRepository(Folder).findOne({
      where: { id: folderId },
      relations: { project: { user: true } },
    });

    if (folderToDelete === null) {
      throw new Error("No folder found with this folderId");
    }

    if (folderToDelete.project.user.id !== userId) {
      throw new Error("This user isn't the owner of the folder/project");
    }

    try {
      await dataSource.manager.getRepository(Folder).remove(folderToDelete);
      return `Folder deleted`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }
}
