import { Arg, Mutation, Query, Resolver } from "type-graphql";

import dataSource from "../dataSource";
import Project from "../entity/project";
import User from "../entity/user";
import Comment from "../entity/comment";

@Resolver(Comment)
export default class CommentResolver {
  @Query(() => [Comment])
  async getAllComments() {
    const response = await dataSource.getRepository(Comment).find();
    console.warn(response);
    return await dataSource.getRepository(Comment).find();
  }

  @Mutation(() => String)
  async addComment(
    @Arg("idUser") idUser: string,
    @Arg("comment") comment: string,
    @Arg("idProject") idProject: number,
  ): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const newComment = new Comment();
      newComment.project = await dataSource.manager
        .getRepository(Project)
        .findOneByOrFail({
          id: idProject,
        });
      newComment.user = await dataSource.manager
        .getRepository(User)
        .findOneByOrFail({
          id: idUser,
        });
      newComment.comment = comment;

      await dataSource.manager.save(Comment, newComment);

      return `Comment saved`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }
}
