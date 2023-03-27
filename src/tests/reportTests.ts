import client from "./tools/clientUtil";
import clearAllEntities from "./tools/setupDB";
import {
  CREATE_USER,
  CREATE_PROJECT,
  GET_TOKEN,
  ADD_REPORT,
  GET_ALL_REPORTS,
} from "./tools/gql";
import { testUserData, testUserData2 } from "./data/users";
import { testProjectData } from "./data/projects";

const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const reportTests = () => {
  describe("Report resolver", () => {
    beforeAll(async () => {
      await clearAllEntities();
    });
    let projectId = "";
    let reportId = "";
    it("adds a report on a project", async () => {
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
        mutation: ADD_REPORT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: parseInt(projectId, 10),
          content: "Bug found in the code!",
        },
      });
      reportId = res.data?.addReport.id;
      expect(res.data?.addReport).toMatchObject({
        user: {
          email: testUserData2.email,
          pseudo: testUserData2.pseudo,
        },
        project: {
          id: projectId,
        },
        content: "Bug found in the code!",
        createdAt: expect.stringMatching(isoPattern),
      });
    });
    it("fails to add a report without token", async () => {
      const res = await client.mutate({
        mutation: ADD_REPORT,
        variables: {
          idProject: parseInt(projectId, 10),
          content: "Bug found in the code!",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });
    it("fails to add a report with a false idProject", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_REPORT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: 99999,
          content: "Bug found in the code!",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No project found with this idProject");
    });

    it("fails to add a report with empty content", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_REPORT,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idProject: parseInt(projectId, 10),
          content: "",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty comment");
    });

    it("gets all reports", async () => {
      const tokenCommentator = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.query({
        query: GET_ALL_REPORTS,
        context: {
          headers: {
            authorization: tokenCommentator.data?.getTokenWithUser.token,
          },
        },
      });
      expect(res.data?.getAllReports.length).toBeGreaterThanOrEqual(1);
    });

    it("fails to get all reports without token", async () => {
      const res = await client.query({
        query: GET_ALL_REPORTS,
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });
  });
};

export default reportTests;
