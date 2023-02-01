import { Arg, Mutation, Query, Resolver } from "type-graphql";

import Project from "../entity/project";
import dataSource from "../dataSource";
import User from "../entity/user";
import Folder from "../entity/folder";
import File from "../entity/file";

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
  async getSharedProjects() {
    const response = await dataSource.getRepository(Project).find({
      where: { public: true },
      relations: {
        likes: { user: true },
        comments: true,
        reports: true,
        user: true,
      },
    });
    return response;
  }

  @Query(() => [Project])
  async getProjectsByUserId(@Arg("userId") userId: string) {
    const user = await dataSource.manager.findOneByOrFail(User, {
      id: userId,
    });

    const response = await dataSource.getRepository(Project).find({
      where: { user },
      relations: {
        likes: true,
        folders: true,
        comments: true,
        reports: true,
        user: true,
      },
    });
    return response;
  }

  @Query(() => Project)
  async getOneProject(@Arg("id") id: number): Promise<Project> {
    const project = await dataSource.manager.getRepository(Project).findOne({
      where: {
        id,
      },
      relations: {
        likes: true,
        folders: true,
        comments: true,
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

  @Mutation(() => String)
  async createProject(
    @Arg("public") isPublic: boolean,
    @Arg("name") name: string,
    @Arg("description") description: string,
    @Arg("userId") userId: string,
  ): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const newProject = new Project();
      newProject.public = isPublic;
      newProject.name = name;
      newProject.description = description;
      const user = await dataSource.manager.findOneByOrFail(User, {
        id: userId,
      });
      newProject.user = user;
      const projectInDB = await dataSource.manager.save(Project, newProject);

      const folder = new Folder();
      folder.project = await dataSource.manager
        .getRepository(Project)
        .findOneByOrFail({
          id: projectInDB.id,
        });
      folder.name = "MyProject";
      const folderInDB = await dataSource.manager.save(Folder, folder);

      const file = new File();
      file.folder = await dataSource.manager
        .getRepository(Folder)
        .findOneByOrFail({
          id: folderInDB.id,
        });
      file.name = "Index";
      file.extension = "js";
      file.content = "Console.log('Hello World')";
      await dataSource.manager.save(File, file);

      return `Project created`;
    } catch (error) {
      throw new Error("Error: try again with an other body");
    }
  }

  @Mutation(() => String)
  async modifyProject(
    @Arg("id") id: number,
    @Arg("name", { nullable: true }) name?: string,
    @Arg("description", { nullable: true }) description?: string,
    @Arg("public", { nullable: true }) isPublic?: boolean,
  ): Promise<string> {
    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new Error();
    }
    if (name == null && isPublic == null && description == null) {
      throw new Error(
        `No change, specify argument to change for the project ${id.toString()}`,
      );
    }

    const projectToUpdate = await dataSource.manager
      .getRepository(Project)
      .findOneByOrFail({
        id,
      });

    if (isPublic != null) {
      projectToUpdate.public = isPublic;
    }
    if (name != null) {
      projectToUpdate.name = name;
    }
    if (description != null) {
      projectToUpdate.description = description;
    }

    try {
      projectToUpdate.updatedAt = new Date();
      await dataSource.manager.save(Project, projectToUpdate);
      return `Project modified`;
    } catch (error) {
      throw new Error("Error: Project not found");
    }
  }

  @Mutation(() => String)
  async deleteProject(@Arg("id") id: number): Promise<string> {
    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new Error();
    }
    const projectToDelete = await dataSource.manager
      .getRepository(Project)
      .findOneByOrFail({
        id,
      });

    try {
      await dataSource.manager.getRepository(Project).remove(projectToDelete);
      return `Project deleted`;
    } catch (error) {
      throw new Error("Error: Project not found");
    }
  }
}
