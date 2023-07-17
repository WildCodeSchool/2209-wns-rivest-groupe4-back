import client from "./tools/clientUtil";
import clearAllEntities from "./tools/setupDB";
import {
  CREATE_USER,
  CREATE_PROJECT,
  GET_TOKEN,
  ADD_COMMENT,
  GET_ALL_COMMENTS_BY_PROJECT,
  GET_MONTHLY_COMMENTS_BY_USER,
  MODIFY_COMMENT,
  DELETE_COMMENT,
} from "./tools/gql";
import { testUserData, testUserData2 } from "./data/users";
import { testProjectData } from "./data/projects";

const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const commentTests = () => {
  describe("Comment resolver", () => {
    beforeAll(async () => {
      await clearAllEntities();
    });
    let projectId = "";
    let commentId = "";
    it("adds a comment on a project", async () => {
      await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
          pseudo: testUserData.pseudo,
        },
      });

      await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
          pseudo: testUserData2.pseudo,
        },
      });

      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });

      const project = await client.mutate({
        mutation: CREATE_PROJECT,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          description: testProjectData.description,
          name: testProjectData.name,
          isPublic: testProjectData.isPublic,
        },
      });

      projectId = project.data?.createProject.id;

      const res = await client.mutate({
        mutation: ADD_COMMENT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: parseInt(projectId, 10),
          comment: "amazing!",
        },
      });
      commentId = res.data?.addComment.id;
      expect(res.data?.addComment).toMatchObject({
        user: {
          email: testUserData2.email,
          pseudo: testUserData2.pseudo,
        },
        project: {
          id: projectId,
        },
        comment: "amazing!",
        createdAt: expect.stringMatching(isoPattern),
        updatedAt: expect.stringMatching(isoPattern),
      });
    });
    it("fails to add a comment without token", async () => {
      const res = await client.mutate({
        mutation: ADD_COMMENT,
        variables: {
          idProject: parseInt(projectId, 10),
          comment: "amazing!",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });
    it("fails to add a comment with a false idProject", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_COMMENT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: 9999,
          comment: "amazing!",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No project found with this idProject");
    });

    it("fails to add a comment with empty content", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_COMMENT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: parseInt(projectId, 10),
          comment: "",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty comment");
    });

    it("modifies a comment", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: MODIFY_COMMENT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idComment: parseInt(commentId, 10),
          content: "New Comment",
        },
      });
      expect(res.data?.modifyComment).toMatchObject({
        id: commentId,
        user: {
          email: testUserData2.email,
          pseudo: testUserData2.pseudo,
        },
        project: {
          id: projectId,
        },
        comment: "New Comment",
        createdAt: expect.stringMatching(isoPattern),
        updatedAt: expect.stringMatching(isoPattern),
      });
    });

    it("fails to modify a comment if the user isn't the owner of the comment", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: MODIFY_COMMENT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idComment: parseInt(commentId, 10),
          content: "Try with false user",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("This user isn't the owner of the comment");
    });

    it("fails to modify a comment without token", async () => {
      const res = await client.mutate({
        mutation: MODIFY_COMMENT,
        variables: {
          idComment: parseInt(commentId, 10),
          content: "New Comment",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to modify a comment with empty content", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: MODIFY_COMMENT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idComment: parseInt(commentId, 10),
          content: "",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty content");
    });

    it("fails to modify a comment with false commentId", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: MODIFY_COMMENT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idComment: 9999,
          content: "Try with false idComment",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No comment found with this id");
    });

    it("gets all comments for a user", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.query({
        query: GET_MONTHLY_COMMENTS_BY_USER,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
      });
      expect(res.data?.getMonthlyCommentsByUser.length).toBeGreaterThanOrEqual(
        1,
      );
    });

    it("fails to get all comments for a user without token", async () => {
      const res = await client.query({
        query: GET_MONTHLY_COMMENTS_BY_USER,
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("gets all comments for a project", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.query({
        query: GET_ALL_COMMENTS_BY_PROJECT,
        variables: { idProject: parseInt(projectId, 10) },
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
      });
      expect(res.data?.getAllCommentsByProjectId.length).toBeGreaterThanOrEqual(
        1,
      );
    });

    it("fails to get all comments for a project without token", async () => {
      const res = await client.query({
        query: GET_ALL_COMMENTS_BY_PROJECT,
        variables: { idProject: parseInt(projectId, 10) },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to get all comments for a project with a false id project", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.query({
        query: GET_ALL_COMMENTS_BY_PROJECT,
        variables: { idProject: 9999 },
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No project found with this idProject");
    });

    it("fails to delete a comment if the user isn't the owner of the comment", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_COMMENT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idComment: parseInt(commentId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("This user isn't the owner of the comment");
    });

    it("deletes a comment", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_COMMENT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idComment: parseInt(commentId, 10),
        },
      });
      expect(res.data?.deleteComment).toBe("Comment deleted");
    });

    it("fails to delete a comment without a token", async () => {
      const res = await client.mutate({
        mutation: DELETE_COMMENT,
        variables: {
          idComment: parseInt(commentId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to delete a comment with false idComment", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_COMMENT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idComment: 9999,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No comment found with this id");
    });
  });
};

export default commentTests;
