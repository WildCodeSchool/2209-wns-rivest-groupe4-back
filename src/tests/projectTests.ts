import client from "./tools/clientUtil";
import clearAllEntities from "./tools/setupDB";
import {
  CREATE_USER,
  CREATE_PROJECT,
  GET_TOKEN,
  MODIFY_PROJECT,
  GET_ALL_PROJECTS,
  GET_ONE_PROJECT,
  DELETE_PROJECT,
} from "./tools/gql";
import { testUserData, testUserData4 } from "./data/users";

import {
  testProjectData,
  testProjectData2,
  testProjectData3,
  testProjectData4,
} from "./data/projects";

const projectTests = () => {
  describe("Project resolver", () => {
    beforeAll(async () => {
      await clearAllEntities();
    });
    let projectId = "";
    it("creates a project", async () => {
      await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
          pseudo: testUserData.pseudo,
        },
      });

      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const res = await client.mutate({
        mutation: CREATE_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          description: testProjectData.description,
          name: testProjectData.name,
          isPublic: testProjectData.isPublic,
        },
      });

      projectId = res.data?.createProject.id;

      expect(res.data?.createProject).toMatchObject({
        name: testProjectData.name,
        description: testProjectData.description,
        isPublic: testProjectData.isPublic,
        user: {
          email: testUserData.email,
          pseudo: testUserData.pseudo,
        },
        folders: [
          {
            name: testProjectData.name,
            files: [
              {
                name: "index",
                extension: "js",
                content: "console.log('Hello World')",
              },
            ],
          },
        ],
      });
    });

    it("fails to create a project if an other existing project for the same user has the same name", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const res = await client.mutate({
        mutation: CREATE_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          description: testProjectData2.description,
          name: testProjectData.name,
          isPublic: testProjectData2.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Project with same user and same name already exists",
      );
    });

    it("fails to create a project with an empty name", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const res = await client.mutate({
        mutation: CREATE_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          description: testProjectData2.description,
          name: "",
          isPublic: testProjectData2.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty project name");
    });

    it("fails to create a project with an empty description", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const res = await client.mutate({
        mutation: CREATE_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          description: "",
          name: testProjectData3.name,
          isPublic: testProjectData2.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty project description");
    });

    it("fails to create a project without token", async () => {
      const res = await client.mutate({
        mutation: CREATE_PROJECT,
        variables: {
          description: testProjectData2.description,
          name: testProjectData2.name,
          isPublic: testProjectData2.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to modify a project with empty name", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const res = await client.mutate({
        mutation: CREATE_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          description: testProjectData2.description,
          name: "",
          isPublic: testProjectData2.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty project name");
    });

    it("fails to modify a project with empty description", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const res = await client.mutate({
        mutation: CREATE_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          description: "",
          name: testProjectData2.name,
          isPublic: testProjectData2.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty project description");
    });

    it("modifies a project", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const res = await client.mutate({
        mutation: MODIFY_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          modifyProjectId: parseInt(projectId, 10),
          description: testProjectData3.description,
          name: testProjectData3.name,
          isPublic: testProjectData3.isPublic,
        },
      });
      expect(res.data?.modifyProject).toMatchObject({
        name: testProjectData3.name,
        description: testProjectData3.description,
        isPublic: testProjectData3.isPublic,
        user: {
          email: testUserData.email,
          pseudo: testUserData.pseudo,
        },
        folders: [
          {
            name: testProjectData3.name,
            files: [
              {
                name: "index",
                extension: "js",
                content: "console.log('Hello World')",
              },
            ],
          },
        ],
      });
    });

    it("fails to modify a project if the initiator isn't the owner", async () => {
      await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData4.email,
          password: testUserData4.password,
          pseudo: testUserData4.pseudo,
        },
      });

      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData4.email,
          password: testUserData4.password,
        },
      });

      const res = await client.mutate({
        mutation: MODIFY_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          modifyProjectId: parseInt(projectId, 10),
          description: testProjectData4.description,
          name: testProjectData4.name,
          isPublic: testProjectData4.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("This user isn't the owner of the project");
    });

    it("fails to modify a project without token", async () => {
      const res = await client.mutate({
        mutation: MODIFY_PROJECT,
        variables: {
          modifyProjectId: parseInt(projectId, 10),
          description: testProjectData3.description,
          name: testProjectData3.name,
          isPublic: testProjectData3.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to modify a project with empty name", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: MODIFY_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          modifyProjectId: parseInt(projectId, 10),
          description: testProjectData3.description,
          name: "",
          isPublic: testProjectData3.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty project name");
    });

    it("fails to modify a project with empty description", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: MODIFY_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          modifyProjectId: parseInt(projectId, 10),
          description: "",
          name: testProjectData3.name,
          isPublic: testProjectData3.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty project description");
    });

    it("fails to modify a project with false idProject", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: MODIFY_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          modifyProjectId: 9999,
          description: testProjectData3.description,
          name: testProjectData4.name,
          isPublic: testProjectData3.isPublic,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No project found with id: 9999");
    });

    it("gets all projects", async () => {
      const res = await client.mutate({
        mutation: GET_ALL_PROJECTS,
      });
      expect(res.data?.getAllProjects.length).toBeGreaterThanOrEqual(1);
    });

    it("gets one project", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: GET_ONE_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          getOneProjectId: parseInt(projectId, 10),
        },
      });
      expect(res.data?.getOneProject.name).toBe(testProjectData3.name);
      expect(res.data?.getOneProject.description).toBe(
        testProjectData3.description,
      );
    });

    it("gets all projects", async () => {
      const res = await client.mutate({
        mutation: GET_ALL_PROJECTS,
      });
      expect(res.data?.getAllProjects.length).toBeGreaterThanOrEqual(1);
    });

    it("gets one project", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: GET_ONE_PROJECT,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
        variables: {
          getOneProjectId: parseInt(projectId, 10),
        },
      });
      expect(res.data?.getOneProject.name).toBe(testProjectData3.name);
      expect(res.data?.getOneProject.description).toBe(
        testProjectData3.description,
      );
    });

    it("fails to delete a project if the initiator isn't the owner", async () => {
      await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData4.email,
          password: testUserData4.password,
          pseudo: testUserData4.pseudo,
        },
      });

      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData4.email,
          password: testUserData4.password,
        },
      });

      const res = await client.mutate({
        mutation: DELETE_PROJECT,
        variables: {
          deleteProjectId: parseInt(projectId, 10),
        },
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("This user isn't the owner of the project");
    });

    it("deletes a project", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_PROJECT,
        variables: {
          deleteProjectId: parseInt(projectId, 10),
        },
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
      });
      expect(res.data?.deleteProject).toBe("Project deleted");
    });

    it("fails to delete a project without token", async () => {
      const res = await client.mutate({
        mutation: DELETE_PROJECT,
        variables: {
          deleteProjectId: parseInt(projectId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to delete a project with a false idProject", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_PROJECT,
        variables: {
          deleteProjectId: 9999,
        },
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No project found with id: 9999");
    });
  });
};

export default projectTests;
