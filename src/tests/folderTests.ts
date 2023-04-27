import client from "./tools/clientUtil";
import clearAllEntities from "./tools/setupDB";
import {
  CREATE_USER,
  CREATE_PROJECT,
  GET_TOKEN,
  ADD_FOLDER,
  RENAME_FOLDER,
  GET_ALL_FOLDERS_BY_PROJECT,
  DELETE_FOLDER,
} from "./tools/gql";
import { testUserData, testUserData2 } from "./data/users";
import { testProjectData } from "./data/projects";

const folderTests = () => {
  describe("Folder resolver", () => {
    beforeAll(async () => {
      await clearAllEntities();
    });
    let parentFolderId = "";
    let folderId = "";
    let projectId = "";
    it("adds a folder", async () => {
      await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
          pseudo: testUserData.pseudo,
        },
      });

      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
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

      parentFolderId = project.data?.createProject.folders[0].id;
      projectId = project.data?.createProject.id;

      const res = await client.mutate({
        mutation: ADD_FOLDER,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          parentFolderId: parseInt(parentFolderId, 10),
          name: "src",
        },
      });
      folderId = res.data?.addFolder.id;
      expect(res.data?.addFolder).toMatchObject({
        name: "src",
        parentFolder: {
          id: parentFolderId,
        },
      });
    });

    it("fails to add a folder without token", async () => {
      const res = await client.mutate({
        mutation: ADD_FOLDER,
        variables: {
          parentFolderId: parseInt(parentFolderId, 10),
          name: "src2",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to add a folder with a false idParentFolder", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_FOLDER,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          parentFolderId: 9999,
          name: "src2",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No folder found with this parentFolderId");
    });

    it("fails to add a folder with empty name", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_FOLDER,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          parentFolderId: parseInt(parentFolderId, 10),
          name: "",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty folder name");
    });

    it("fails to add a folder with same name", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_FOLDER,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          parentFolderId: parseInt(parentFolderId, 10),
          name: "src",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Folder with same name and same parentFolder already exists",
      );
    });

    it("fails to add a folder if the intiator isn't the owner of the project", async () => {
      await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
          pseudo: testUserData2.pseudo,
        },
      });
      const tokenAnotherUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: ADD_FOLDER,
        context: {
          headers: {
            authorization: tokenAnotherUser.data?.getTokenWithUser.token,
          },
        },
        variables: {
          parentFolderId: parseInt(parentFolderId, 10),
          name: "src2",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "This user isn't the owner of the folder/project",
      );
    });

    it("renames a folder", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: RENAME_FOLDER,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(folderId, 10),
          name: "assets",
        },
      });
      expect(res.data?.renameFolder).toMatchObject({
        id: folderId,
        name: "assets",
      });
    });

    it("fails to rename a folder if the user isn't the owner of the comment", async () => {
      const tokenOtherUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: RENAME_FOLDER,
        context: {
          headers: {
            authorization: tokenOtherUser.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(folderId, 10),
          name: "assets",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "This user isn't the owner of the folder/project",
      );
    });

    it("fails to rename a folder without token", async () => {
      const res = await client.mutate({
        mutation: RENAME_FOLDER,
        variables: {
          folderId: parseInt(folderId, 10),
          name: "assets",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to rename a folder with empty name", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: RENAME_FOLDER,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(folderId, 10),
          name: "",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty folder name");
    });

    it("fails to rename a folder with false folderId", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: RENAME_FOLDER,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: 9999,
          name: "assets2",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No folder found with this folderId");
    });

    it("gets all folders for a project", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.query({
        query: GET_ALL_FOLDERS_BY_PROJECT,
        variables: { idProject: parseInt(projectId, 10) },
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
      });
      expect(res.data?.getAllFoldersByProjectId.length).toBeGreaterThanOrEqual(
        1,
      );
    });

    it("fails to get all folders for a project without token", async () => {
      const res = await client.query({
        query: GET_ALL_FOLDERS_BY_PROJECT,
        variables: { idProject: parseInt(projectId, 10) },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to get all folders for a project with a false id project", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.query({
        query: GET_ALL_FOLDERS_BY_PROJECT,
        variables: { idProject: 9999 },
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No project found with this idProject");
    });

    it("fails to delete a folder if the user isn't the owner of the comment", async () => {
      const tokenOtherUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_FOLDER,
        context: {
          headers: {
            authorization: tokenOtherUser.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(folderId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "This user isn't the owner of the folder/project",
      );
    });

    it("deletes a folder", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_FOLDER,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(folderId, 10),
        },
      });
      expect(res.data?.deleteFolder).toBe("Folder deleted");
    });

    it("fails to delete a folder without a token", async () => {
      const res = await client.mutate({
        mutation: DELETE_FOLDER,
        variables: {
          folderId: parseInt(folderId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to delete a folder with false idFolder", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_FOLDER,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: 9999,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No folder found with this folderId");
    });
  });
};

export default folderTests;
