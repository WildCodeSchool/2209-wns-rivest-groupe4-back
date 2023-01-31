import { Arg, Mutation, Query, Resolver } from "type-graphql";

import Like from "../entity/like";
import dataSource from "../dataSource";
import Project from "../entity/project";
import User from "../entity/user";

@Resolver(Like)
export default class LikeResolver {
  @Query(() => [Like])
  async getAllLikes() {
    const response = await dataSource.getRepository(Like).find();
    console.warn(response);
    return await dataSource
      .getRepository(Like)
      .find({ relations: { project: true, user: true } });
  }

  @Mutation(() => String)
  async addLike(
    @Arg("idUser") idUser: string,
    @Arg("idProject") idProject: number,
  ): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const like = new Like();

      like.project = await dataSource.manager
        .getRepository(Project)
        .findOneByOrFail({
          id: idProject,
        });

      console.warn(like.project);

      like.user = await dataSource.manager.getRepository(User).findOneByOrFail({
        id: idUser,
      });

      console.warn(like.user);
      console.warn(like);

      await dataSource.manager.save(Like, like);

      return `Like saved`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }
}
