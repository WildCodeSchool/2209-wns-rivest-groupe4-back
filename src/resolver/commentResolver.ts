import { Arg, Mutation, Query, Resolver } from "type-graphql";

import dataSource from "../dataSource";
import Project from "../entity/project";
import User from "../entity/user";
import Comment from "../entity/comment";

@Resolver(Comment)
export default class CommentResolver {
  @Query(() => [Comment])
  async getAllComments() {
    return await dataSource.getRepository(Comment).find();
  }

  @Query(() => [Comment])
  async getAllCommentsByProjectId(@Arg("idProject") idProject: number) {
    const response = await dataSource.getRepository(Comment).find({
      where: { project: { id: idProject } },
      relations: { user: true },
    });
    return response;
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

  @Mutation(() => String)
  async modifyComment(
    @Arg("id") id: number,
    @Arg("content") content: string,
  ): Promise<string> {
    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new Error();
    }

    const commentToUpdate = await dataSource.manager
      .getRepository(Comment)
      .findOneByOrFail({
        id,
      });

    commentToUpdate.comment = content;

    try {
      await dataSource.manager.save(Comment, commentToUpdate);
      return `Comment modified`;
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

  @Mutation(() => String)
  async deleteComment(@Arg("idComment") idComment: number): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const commentToDelete = await dataSource.manager
        .getRepository(Comment)
        .findOneByOrFail({ id: idComment });

      await dataSource.manager.getRepository(Comment).remove(commentToDelete);

      return `Comment deleted`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }
}
