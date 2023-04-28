import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import dataSource from "../dataSource";
import File from "../entities/file";
import Folder from "../entities/folder";
import Project from "../entities/project";
import Validate from "../utils/regex";

@Resolver(File)
export default class FileResolver {
  @Authorized()
  @Query(() => [File])
  async getAllFilesByProjectId(@Arg("projectId") projectId: number) {
    const project = await dataSource
      .getRepository(Project)
      .findOneBy({ id: projectId });

    if (project === null) {
      throw new Error("No project found with this projectId");
    }

    try {
      const filesFromDb = await dataSource.getRepository(File).find({
        where: { folder: { project: { id: projectId } } },
        relations: { folder: { project: true } },
      });
      return filesFromDb;
    } catch {
      throw new Error("Error while getting files from this project");
    }
  }

  @Authorized()
  @Query(() => [File])
  async getAllFilesByFolderId(@Arg("folderId") folderId: number) {
    const folder = await dataSource
      .getRepository(Folder)
      .findOneBy({ id: folderId });

    if (folder === null) {
      throw new Error("No folder found with this folderId");
    }

    try {
      const filesFromDb = await dataSource.getRepository(File).find({
        where: { folder: { id: folderId } },
        relations: { folder: true },
      });
      return filesFromDb;
    } catch {
      throw new Error("Error while getting files from this folder");
    }
  }

  @Authorized()
  @Mutation(() => File)
  async addFile(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("name") name: string,
    @Arg("extension") extension: string,
    @Arg("folderId") folderId: number,
    @Arg("content", { nullable: true }) content?: string,
  ): Promise<File> {
    const {
      userFromToken: { userId },
    } = context;

    const parentFolder = await dataSource.getRepository(Folder).findOne({
      where: { id: folderId },
      relations: { project: { user: true } },
    });

    if (parentFolder === null) {
      throw new Error("No folder found with this folderId");
    }

    const fileWithSameName = await dataSource.getRepository(File).findOne({
      where: { folder: { id: parentFolder.id }, name },
    });

    if (fileWithSameName != null) {
      throw new Error("File with same name in the same folder already exists");
    }

    if (name === "") {
      throw new Error("No empty file name");
    }

    if (extension === "") {
      throw new Error("No empty file extension");
    }

    if (!Validate.fileName(name)) {
      throw new Error(
        "File name format: only letters (upper and lower case) with numbers are allowed",
      );
    }

    if (!Validate.extension(extension)) {
      throw new Error("Extension format: only lowerCase letters are allowed");
    }

    if (parentFolder.project.user.id !== userId) {
      throw new Error("This user isn't the owner of the folder/project");
    }

    const file = new File();
    file.folder = parentFolder;
    file.name = name;
    file.extension = extension;
    if (content != null) {
      file.content = content;
    } else {
      file.content = "";
    }

    try {
      const fileInBD = await dataSource.manager.save(File, file);
      return fileInBD;
    } catch {
      throw new Error("Error while saving file");
    }
  }

  @Authorized()
  @Mutation(() => File)
  async modifyFile(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("idFile") idFile: number,
    @Arg("name", { nullable: true }) name?: string,
    @Arg("content", { nullable: true }) content?: string,
    @Arg("extension", { nullable: true }) extension?: string,
  ): Promise<File> {
    const {
      userFromToken: { userId },
    } = context;

    const fileToModify = await dataSource.getRepository(File).findOne({
      where: { id: idFile },
      relations: { folder: { project: { user: true } } },
    });

    if (name === "") {
      throw new Error("No empty file name");
    }
    if (extension === "") {
      throw new Error("No empty file extension");
    }
    if (fileToModify === null) {
      throw new Error("No file found with this fileId");
    }

    if (fileToModify.folder.project.user.id !== userId) {
      throw new Error("This user isn't the owner of the file/project");
    }

    if (name != null) {
      fileToModify.name = name;
      if (!Validate.fileName(name)) {
        throw new Error(
          "File name format: only letters (upper and lower case) with numbers are allowed",
        );
      }
    }

    if (extension != null) {
      fileToModify.extension = extension;
      if (!Validate.extension(extension)) {
        throw new Error("Extension format: only lowerCase letters are allowed");
      }
    }

    if (content != null) {
      fileToModify.content = content;
    }

    try {
      const fileInBD = await dataSource.manager.save(File, fileToModify);
      return fileInBD;
    } catch {
      throw new Error("Error while saving the file");
    }
  }

  @Authorized()
  @Mutation(() => String)
  async deleteFile(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("fileId") fileId: number,
  ): Promise<string> {
    const {
      userFromToken: { userId },
    } = context;
    const fileToDelete = await dataSource.getRepository(File).findOne({
      where: { id: fileId },
      relations: { folder: { project: { user: true } } },
    });

    if (fileToDelete === null) {
      throw new Error("No file found with this fileId");
    }

    if (fileToDelete.folder.project.user.id !== userId) {
      throw new Error("This user isn't the owner of the file/project");
    }

    try {
      await dataSource.manager.getRepository(File).remove(fileToDelete);
      return `File deleted`;
    } catch {
      throw new Error("Error while deleting this file");
    }
  }
}
