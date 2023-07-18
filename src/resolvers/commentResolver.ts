import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { MoreThan } from "typeorm";
import dataSource from "../dataSource";
import Project from "../entities/project";
import User from "../entities/user";
import Comment from "../entities/comment";

@Resolver(Comment)
export default class CommentResolver {
  @Query(() => [Comment])
  async getAllComments() {
    return await dataSource
      .getRepository(Comment)
      .find({ relations: { project: true } });
  }

  @Authorized()
  @Query(() => [Comment])
  async getAllCommentsByProjectId(@Arg("idProject") idProject: number) {
    const response = await dataSource.getRepository(Comment).find({
      where: { project: { id: idProject } },
      relations: { user: true },
    });
    if (response.length === 0) {
      throw new Error("No project found with this idProject");
    }
    return response;
  }

  @Authorized()
  @Query(() => [Comment])
  async getMonthlyCommentsByUser(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
  ) {
    const {
      userFromToken: { userId },
    } = context;

    const user = await dataSource.manager.findOneByOrFail(User, {
      id: userId,
    });

    const response = await dataSource.getRepository(Comment).find({
      where: {
        user,
        createdAt: MoreThan(
          new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
        ),
      },
    });
    return response;
  }

  @Authorized()
  @Mutation(() => Comment)
  async addComment(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("comment") comment: string,
    @Arg("idProject") idProject: number,
  ): Promise<Comment> {
    const {
      userFromToken: { userId },
    } = context;

    const projectToComment = await dataSource.getRepository(Project).findOne({
      where: { id: idProject },
      relations: { user: true },
    });

    if (comment === "") {
      throw new Error("No empty comment");
    }

    if (projectToComment === null) {
      throw new Error("No project found with this idProject");
    }

    const newComment = new Comment();
    newComment.project = projectToComment;
    newComment.user = await dataSource.manager
      .getRepository(User)
      .findOneByOrFail({
        id: userId,
      });
    newComment.comment = comment;

    try {
      const commentInBD = await dataSource.manager.save(Comment, newComment);
      return await dataSource.getRepository(Comment).findOneOrFail({
        where: { id: commentInBD.id },
        relations: { project: { comments: { user: true } }, user: true },
      });
    } catch {
      throw new Error("Error while saving comment");
    }
  }

  @Authorized()
  @Mutation(() => Comment)
  async modifyComment(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("idComment") idComment: number,
    @Arg("content") content: string,
  ): Promise<Comment> {
    const {
      userFromToken: { userId },
    } = context;

    const commentToUpdate = await dataSource.getRepository(Comment).findOne({
      where: { id: idComment },
      relations: { user: true, project: true },
    });

    if (content === "") {
      throw new Error("No empty content");
    }

    if (commentToUpdate === null) {
      throw new Error("No comment found with this id");
    }

    if (commentToUpdate.user.id !== userId) {
      throw new Error("This user isn't the owner of the comment");
    }

    commentToUpdate.comment = content;

    try {
      commentToUpdate.updatedAt = new Date();
      const commentSaved = await dataSource.manager.save(
        Comment,
        commentToUpdate,
      );
      return await dataSource.getRepository(Comment).findOneOrFail({
        where: { id: commentSaved.id },
        relations: { project: { comments: true }, user: true },
      });
    } catch {
      throw new Error("Error while modifying the comment");
    }
  }

  @Authorized()
  @Mutation(() => String)
  async deleteComment(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("idComment") idComment: number,
  ): Promise<string> {
    const {
      userFromToken: { userId },
    } = context;

    const commentToDelete = await dataSource.getRepository(Comment).findOne({
      where: { id: idComment },
      relations: { user: true },
    });

    if (commentToDelete === null) {
      throw new Error("No comment found with this id");
    }

    if (commentToDelete.user.id !== userId) {
      throw new Error("This user isn't the owner of the comment");
    }

    try {
      await dataSource.manager.getRepository(Comment).remove(commentToDelete);
      return "Comment deleted";
    } catch {
      throw new Error("Error while deleting comment");
    }
  }
}
