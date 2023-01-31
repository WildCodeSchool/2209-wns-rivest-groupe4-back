import { Arg, Mutation, Query, Resolver } from "type-graphql";

import Project from "../entity/project";
import dataSource from "../dataSource";
import User from "../entity/user";

@Resolver(Project)
export default class ProjectResolver {
  @Query(() => [Project])
  async getProjectsWithLikes() {
    const response = await dataSource
      .getRepository(Project)
      .find({ relations: { likes: true } });
    console.warn(response[0].likes);
    return response;
  }

  @Query(() => [Project])
  async getOneProject(@Arg("id") id: number): Promise<Project> {
    return await dataSource.manager.getRepository(Project).findOneByOrFail({
      id,
    });
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
      await dataSource.manager.save(Project, newProject);

      return `Project created`;
    } catch (error) {
      throw new Error("Error: try again with an other body");
    }
  }

  @Mutation(() => String)
  async modifyProject(
    @Arg("id") id: number,
    @Arg("public") isPublic: boolean,
    @Arg("name") name: string,
    @Arg("description") description: string,
  ): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const projectToUpdate = await dataSource.manager
        .getRepository(Project)
        .findOneByOrFail({
          id,
        });

      projectToUpdate.public = isPublic;
      projectToUpdate.name = name;
      projectToUpdate.description = description;
      await dataSource.manager.save(Project, projectToUpdate);

      return `Project modified`;
    } catch (error) {
      throw new Error("Error: Project not found");
    }
  }
}
