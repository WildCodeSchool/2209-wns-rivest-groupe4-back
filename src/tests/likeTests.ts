import client from "./tools/clientUtil";
import clearAllEntities from "./tools/setupDB";
import {
  CREATE_USER,
  CREATE_PROJECT,
  GET_TOKEN,
  ADD_LIKE,
  DELETE_LIKE,
  GET_ALL_LIKES_BY_USER,
} from "./tools/gql";
import { testUserData, testUserData2 } from "./data/users";
import { testProjectData } from "./data/projects";

const likeTests = () => {
  describe("Like resolver", () => {
    beforeAll(async () => {
      await clearAllEntities();
    });
    let projectId = "";
    it("adds a like on a project", async () => {
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

      const tokenLiker = await client.mutate({
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
        mutation: ADD_LIKE,
        context: {
          headers: {
            authorization: tokenLiker.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: parseInt(projectId, 10),
        },
      });
      expect(res.data?.addLike).toBe("Like saved");
    });

    it("fails to add a like without token", async () => {
      const res = await client.mutate({
        mutation: ADD_LIKE,
        variables: {
          idProject: parseInt(projectId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to add a like on an own project", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_LIKE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: parseInt(projectId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("The owner of the project cannot like himself");
    });

    it("fails to add a like with a false idProject", async () => {
      const tokenLiker = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_LIKE,
        context: {
          headers: {
            authorization: tokenLiker.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: 9999,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No project found with this idProject");
    });

    it("fails to add a like if project is already liked", async () => {
      const tokenLiker = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_LIKE,
        context: {
          headers: {
            authorization: tokenLiker.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: parseInt(projectId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Like already existing with this user on this project",
      );
    });

    it("gets all likes for a user", async () => {
      const tokenLiker = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.query({
        query: GET_ALL_LIKES_BY_USER,
        context: {
          headers: {
            authorization: tokenLiker.data?.getTokenWithUser.token,
          },
        },
      });
      expect(res.data?.getAllLikesByUser.length).toBeGreaterThanOrEqual(1);
    });

    it("deletes like", async () => {
      const tokenLiker = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_LIKE,
        context: {
          headers: {
            authorization: tokenLiker.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: parseInt(projectId, 10),
        },
      });
      expect(res.data?.deleteLike).toBe("Like deleted");
    });

    it("fails to delete like if there is no like from this user on the project", async () => {
      const tokenLiker = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_LIKE,
        context: {
          headers: {
            authorization: tokenLiker.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: parseInt(projectId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "No like to delete with this user on this project",
      );
    });

    it("fails to delete like the projectId is false", async () => {
      const tokenLiker = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_LIKE,
        context: {
          headers: {
            authorization: tokenLiker.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: 9999,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No project found with this idProject");
    });

    it("fails to delete like without token", async () => {
      const res = await client.mutate({
        mutation: DELETE_LIKE,
        variables: {
          idProject: parseInt(projectId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });
  });
};

export default likeTests;
