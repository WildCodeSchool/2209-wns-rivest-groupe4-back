import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import Project from "../entities/project";
import dataSource from "../dataSource";
import User from "../entities/user";
import Folder from "../entities/folder";
import File from "../entities/file";

@Resolver(Project)
export default class ProjectResolver {
  @Query(() => [Project])
  async getAllProjects() {
    const response = await dataSource.getRepository(Project).find({
      relations: {
        likes: { user: true },
        folders: { files: true },
        comments: true,
        reports: true,
        user: true,
      },
    });
    return response;
  }

  @Query(() => [Project])
  async getSharedProjects(
    @Arg("limit") limit: number,
    @Arg("offset") offset: number,
    @Arg("orderBy", { nullable: true, defaultValue: "createdAt" })
    orderBy: "createdAt" | "likes" | "comments",
    @Arg("order", { nullable: true, defaultValue: "ASC" })
    order: "ASC" | "DESC",
    @Arg("userSearch", { nullable: true }) userSearch?: string,
    @Arg("projectName", { nullable: true }) projectName?: string,
  ) {
    return await dataSource
      .getRepository(Project)
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.likes", "likes")
      .leftJoinAndSelect("likes.user", "likeUser")
      .leftJoinAndSelect("project.comments", "comments")
      .leftJoinAndSelect("project.reports", "reports")
      .leftJoinAndSelect("project.user", "user")
      .addSelect(
        orderBy !== "createdAt" ? `COUNT(${orderBy}.id)` : "COUNT(likes.id)",
        "count",
      )
      .where("project.isPublic = :isPublic", { isPublic: true })
      .andWhere(userSearch ? "user.pseudo = :pseudo" : "1=1", {
        pseudo: userSearch,
      })
      .andWhere(projectName ? "project.name = :name" : "1=1", {
        name: projectName,
      })
      .groupBy(
        "project.id, likes.id, comments.id, reports.id, user.id, likeUser.id",
      )
      .orderBy(orderBy === "createdAt" ? "project.createdAt" : "count", order)
      .skip(offset)
      .take(limit)
      .getMany();
  }

  @Authorized()
  @Query(() => [Project])
  async getProjectsSupported(@Arg("userId") userId: string) {
    const user = await dataSource.manager.findOneByOrFail(User, {
      id: userId,
    });

    const response = await dataSource.getRepository(Project).find({
      where: { likes: { user } },
      relations: {
        likes: { user: true },
        comments: true,
        reports: true,
        user: true,
      },
    });
    return response;
  }

  @Authorized()
  @Query(() => [Project])
  async getProjectsByUserId(@Arg("userId") userId: string) {
    const user = await dataSource.manager.findOneByOrFail(User, {
      id: userId,
    });

    const response = await dataSource.getRepository(Project).find({
      where: { user },
      relations: {
        likes: { user: true },
        folders: true,
        comments: { user: true },
        reports: true,
        user: true,
      },
    });
    return response;
  }

  @Authorized()
  @Query(() => Project)
  async getOneProject(@Arg("id") id: number): Promise<Project> {
    const project = await dataSource.manager.getRepository(Project).findOne({
      where: {
        id,
      },
      relations: {
        likes: { user: true },
        folders: true,
        comments: { user: true },
        reports: true,
        user: true,
      },
    });
    if (project != null) {
      return project;
    } else {
      throw new Error("Project not found");
    }
  }

  @Authorized()
  @Mutation(() => Project)
  async createProject(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("isPublic") isPublic: boolean,
    @Arg("name") name: string,
    @Arg("description") description: string,
  ): Promise<Project> {
    const {
      userFromToken: { userId },
    } = context;

    const user = await dataSource.manager.findOneByOrFail(User, {
      id: userId,
    });

    if (name === "") {
      throw new Error("No empty project name");
    }
    if (description === "") {
      throw new Error("No empty project description");
    }

    const projectWithSameName = await dataSource.manager.findOneBy(Project, {
      user,
      name,
    });

    if (projectWithSameName != null) {
      throw new Error("Project with same user and same name already exists");
    }

    const newProject = new Project();
    newProject.isPublic = isPublic;
    newProject.name = name;
    newProject.description = description;
    newProject.user = user;

    let projectInDB;
    try {
      projectInDB = await dataSource.manager.save(Project, newProject);

      const folder = new Folder();
      folder.project = await dataSource.manager
        .getRepository(Project)
        .findOneByOrFail({
          id: projectInDB.id,
        });
      folder.name = name;

      const folderInDB = await dataSource.manager.save(Folder, folder);

      const file = new File();
      file.folder = await dataSource.manager
        .getRepository(Folder)
        .findOneByOrFail({
          id: folderInDB.id,
        });
      file.name = "index";
      file.extension = "js";
      file.content = "console.log('Hello World')";

      await dataSource.manager.save(File, file);

      folderInDB.files = [file];
      projectInDB.folders = [folderInDB];
    } catch {
      throw new Error("Error while saving new project");
    }
    return projectInDB;
  }

  @Authorized()
  @Mutation(() => Project)
  async modifyProject(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("id") id: number,
    @Arg("name", { nullable: true }) name?: string,
    @Arg("description", { nullable: true }) description?: string,
    @Arg("isPublic", { nullable: true }) isPublic?: boolean,
  ): Promise<Project> {
    const {
      userFromToken: { userId },
    } = context;

    if (name == null && isPublic == null && description == null) {
      throw new Error(
        `No change, specify argument to change for the project ${id.toString()}`,
      );
    }
    if (name === "") {
      throw new Error("No empty project name");
    }
    if (description === "") {
      throw new Error("No empty project description");
    }

    const projectToUpdate = await dataSource.getRepository(Project).findOne({
      where: {
        id,
      },
      relations: {
        likes: true,
        folders: { files: true },
        comments: true,
        reports: true,
        user: true,
      },
    });

    if (projectToUpdate == null) {
      throw new Error(`No project found with id: ${id.toString()}`);
    }

    if (projectToUpdate.user.id !== userId) {
      throw new Error("This user isn't the owner of the project");
    }

    if (isPublic != null) {
      projectToUpdate.isPublic = isPublic;
    }
    if (name != null) {
      projectToUpdate.name = name;
      projectToUpdate.folders[0].name = name;
    }
    if (description != null) {
      projectToUpdate.description = description;
    }

    try {
      projectToUpdate.updatedAt = new Date();
      await dataSource.manager.save(Project, projectToUpdate);
      return projectToUpdate;
    } catch (error) {
      throw new Error("Error while saving modifications of projects");
    }
  }

  @Authorized()
  @Mutation(() => String)
  async deleteProject(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("id") id: number,
  ): Promise<string> {
    const {
      userFromToken: { userId },
    } = context;

    const projectToDelete = await dataSource.getRepository(Project).findOne({
      where: {
        id,
      },
      relations: {
        likes: true,
        folders: { files: true },
        comments: true,
        reports: true,
        user: true,
      },
    });

    if (projectToDelete === null) {
      throw new Error(`No project found with id: ${id.toString()}`);
    }

    if (projectToDelete.user.id !== userId) {
      throw new Error("This user isn't the owner of the project");
    }

    try {
      await dataSource.manager.getRepository(Project).remove(projectToDelete);
      return "Project deleted";
    } catch (error) {
      throw new Error("Error while deleting project");
    }
  }
}
