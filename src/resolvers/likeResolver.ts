import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

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

  @Authorized()
  @Query(() => [Like])
  async getAllLikesByUser(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
  ) {
    const {
      userFromToken: { userId },
    } = context;

    const user = await dataSource.manager.findOneByOrFail(User, {
      id: userId,
    });

    const response = await dataSource.getRepository(Like).find({
      where: { user },
    });
    return response;
  }

  @Authorized()
  @Query(() => Boolean)
  async projectIsLiked(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("idProject") idProject: number,
  ) {
    const {
      userFromToken: { userId },
    } = context;

    const likeFromDB = await dataSource.manager
      .getRepository(Like)
      .find({ where: { user: { id: userId }, project: { id: idProject } } });

    return likeFromDB.length !== 0;
  }

  @Authorized()
  @Mutation(() => Like)
  async addLike(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("idProject") idProject: number,
  ): Promise<Like> {
    const {
      userFromToken: { userId },
    } = context;

    const projectToLike = await dataSource.getRepository(Project).findOne({
      where: { id: idProject },
      relations: { user: true },
    });

    if (projectToLike === null) {
      throw new Error("No project found with this idProject");
    }

    if (projectToLike.user.id === userId) {
      throw new Error("The owner of the project cannot like himself");
    }

    const likeFromDB = await dataSource.manager
      .getRepository(Like)
      .find({ where: { user: { id: userId }, project: { id: idProject } } });

    if (likeFromDB.length > 0) {
      throw new Error("Like already existing with this user on this project");
    }

    const like = new Like();
    like.project = projectToLike;
    like.user = await dataSource.manager.getRepository(User).findOneByOrFail({
      id: userId,
    });

    try {
      const likeSaved = await dataSource.manager.save(Like, like);
      return await dataSource.manager.getRepository(Like).findOneOrFail({
        where: { id: likeSaved.id },
        relations: { project: { likes: true }, user: true },
      });
    } catch {
      throw new Error("Error while saving like on this project");
    }
  }

  @Authorized()
  @Mutation(() => String)
  async deleteLike(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("idProject") idProject: number,
  ): Promise<string> {
    const {
      userFromToken: { userId },
    } = context;

    const projectToDeleteLike = await dataSource
      .getRepository(Project)
      .findOne({
        where: { id: idProject },
      });

    if (projectToDeleteLike === null) {
      throw new Error("No project found with this idProject");
    }

    const like = await dataSource.manager
      .getRepository(Like)
      .find({ where: { user: { id: userId }, project: { id: idProject } } });

    if (like.length === 0) {
      throw new Error("No like to delete with this user on this project");
    }

    try {
      await dataSource.manager.getRepository(Like).remove(like);
      return `Like deleted`;
    } catch {
      throw new Error("Error while deleting like on this project");
    }
  }
}
