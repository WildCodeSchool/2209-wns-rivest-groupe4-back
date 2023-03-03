import { Arg, Mutation, Query, Resolver } from "type-graphql";

import Like from "../entities/like";
import dataSource from "../dataSource";
import Project from "../entities/project";
import User from "../entities/user";

@Resolver(Like)
export default class LikeResolver {
  @Query(() => [Like])
  async getAllLikes() {
    return await dataSource
      .getRepository(Like)
      .find({ relations: { project: true, user: true } });
  }

  @Query(() => [Like])
  async getAllLikesByUser(@Arg("userId") userId: string) {
    const user = await dataSource.manager.findOneByOrFail(User, {
      id: userId,
    });

    const response = await dataSource.getRepository(Like).find({
      where: { user },
    });
    return response;
  }

  @Mutation(() => String)
  async addLike(
    @Arg("idUser") idUser: string,
    @Arg("idProject") idProject: number,
  ): Promise<string> {
    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new Error();
    }
    const likeFromDB = await dataSource.manager
      .getRepository(Like)
      .find({ where: { user: { id: idUser }, project: { id: idProject } } });

    if (likeFromDB.length > 0) {
      throw new Error("Like already existing with this user on this project");
    }

    const like = new Like();

    const project = await dataSource.manager
      .getRepository(Project)
      .findOneOrFail({
        where: {
          id: idProject,
        },
        relations: { user: true },
      });

    if (project.user.id !== idUser) {
      like.project = project;
    } else {
      throw new Error("The creator of project can't like his own project");
    }

    like.user = await dataSource.manager.getRepository(User).findOneByOrFail({
      id: idUser,
    });

    try {
      await dataSource.manager.save(Like, like);
      return `Like saved`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }

  @Mutation(() => String)
  async deleteLike(
    @Arg("idUser") idUser: string,
    @Arg("idProject") idProject: number,
  ): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const like = await dataSource.manager
        .getRepository(Like)
        .find({ where: { user: { id: idUser }, project: { id: idProject } } });

      await dataSource.manager.getRepository(Like).remove(like);

      return `Like deleted`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }
}
