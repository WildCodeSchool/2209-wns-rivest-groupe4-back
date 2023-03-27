import client from "./tools/clientUtil";
import clearAllEntities from "./tools/setupDB";
import {
  CREATE_USER,
  CREATE_PROJECT,
  GET_TOKEN,
  ADD_FILE,
  MODIFY_COMMENT,
  GET_ALL_FILES_BY_FOLDER,
  GET_ALL_FILES_BY_PROJECT,
  DELETE_FILE,
  MODIFY_FILE,
} from "./tools/gql";
import { testUserData, testUserData2, testUserData4 } from "./data/users";

import {
  testProjectData,
  testProjectData2,
  testProjectData3,
  testProjectData4,
} from "./data/projects";

const fileTests = () => {
  describe("File resolver", () => {
    beforeAll(async () => {
      await clearAllEntities();
    });
    let projectId = "";
    let fileId = "";
    let parentFolderId = "";
    it("adds a file", async () => {
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

      const newProject = await client.mutate({
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

      projectId = newProject.data?.createProject.id;
      parentFolderId = newProject.data?.createProject.folders[0].id;

      const file = await client.mutate({
        mutation: ADD_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(parentFolderId, 10),
          extension: "js",
          content: "console.log('test');",
          name: "test",
        },
      });

      fileId = file.data?.addFile.id;
      expect(file.data?.addFile).toMatchObject({
        folder: {
          id: parentFolderId,
        },
        id: fileId,
        extension: "js",
        content: "console.log('test');",
        name: "test",
      });
    });

    it("fails to add a file if another file existing in the same folder and has the same name", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: ADD_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(parentFolderId, 10),
          extension: "js",
          content: "console.log('test');",
          name: "index",
        },
      });

      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "File with same name in the same folder already exists",
      );
    });

    it("fails to add a file with a false folderId", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: ADD_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: 9999,
          extension: "js",
          content: "console.log('test');",
          name: "index",
        },
      });

      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe("No folder found with this folderId");
    });

    it("fails to add a file with an empty name", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: ADD_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(parentFolderId, 10),
          extension: "js",
          content: "console.log('test');",
          name: "",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty file name");
    });

    it("fails to add a file with an empty extension", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: ADD_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(parentFolderId, 10),
          extension: "",
          content: "console.log('test');",
          name: "app",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty file extension");
    });

    it("fails to add a file with a wrong name format", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: ADD_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(parentFolderId, 10),
          extension: "js",
          content: "console.log('test');",
          name: "app.js",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "File name format: only letters (upper and lower case) with numbers are allowed",
      );
    });

    it("fails to add a file with a wrong extension format", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: ADD_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(parentFolderId, 10),
          extension: "js23DZ",
          content: "console.log('test');",
          name: "app",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Extension format: only lowerCase letters are allowed",
      );
    });

    it("fails to add a file if the initiator isn't the owner of the project", async () => {
      await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
          pseudo: testUserData2.pseudo,
        },
      });

      const tokenOtherUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });

      const file = await client.mutate({
        mutation: ADD_FILE,
        context: {
          headers: {
            authorization: tokenOtherUser.data?.getTokenWithUser.token,
          },
        },
        variables: {
          folderId: parseInt(parentFolderId, 10),
          extension: "js",
          content: "console.log('test');",
          name: "app",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "This user isn't the owner of the folder/project",
      );
    });

    it("fails to add a file without token", async () => {
      const file = await client.mutate({
        mutation: ADD_FILE,
        variables: {
          folderId: parseInt(parentFolderId, 10),
          extension: "js",
          content: "console.log('test');",
          name: "app",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("modifies a file", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: MODIFY_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idFile: parseInt(fileId, 10),
          extension: "ts",
          content: "console.log('file modified');",
          name: "data",
        },
      });
      expect(file.data?.modifyFile).toMatchObject({
        folder: {
          id: parentFolderId,
        },
        id: fileId,
        extension: "ts",
        content: "console.log('file modified');",
        name: "data",
      });
    });

    it("fails to modify a file with wrong name format", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: MODIFY_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idFile: parseInt(fileId, 10),
          extension: "ts",
          content: "console.log('file modified');",
          name: "wrong.SDQ",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "File name format: only letters (upper and lower case) with numbers are allowed",
      );
    });

    it("fails to modify a file with wrong extension format", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: MODIFY_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idFile: parseInt(fileId, 10),
          extension: "t2s",
          content: "console.log('file modified');",
          name: "test",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Extension format: only lowerCase letters are allowed",
      );
    });

    it("fails to modify a file with an empty name", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: MODIFY_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idFile: parseInt(fileId, 10),
          extension: "ts",
          content: "console.log('file modified');",
          name: "",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty file name");
    });

    it("fails to modify a file with an empty extension", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: MODIFY_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idFile: parseInt(fileId, 10),
          extension: "",
          content: "console.log('file modified');",
          name: "newFileName",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe("No empty file extension");
    });

    it("fails to modify a file with a wrong fileID", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const file = await client.mutate({
        mutation: MODIFY_FILE,
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idFile: 9999,
          extension: "ts",
          content: "console.log('file modified');",
          name: "newFileName",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe("No file found with this fileId");
    });

    it("fails to modify a file without token", async () => {
      const file = await client.mutate({
        mutation: MODIFY_FILE,
        variables: {
          idFile: parseInt(fileId, 10),
          extension: "ts",
          content: "console.log('file modified');",
          name: "newFileName",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to modify a file if the initiator isn't the owner of the project", async () => {
      const tokenOtherUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const file = await client.mutate({
        mutation: MODIFY_FILE,
        context: {
          headers: {
            authorization: tokenOtherUser.data?.getTokenWithUser.token,
          },
        },
        variables: {
          idFile: parseInt(fileId, 10),
          extension: "ts",
          content: "console.log('file modified');",
          name: "newFileName",
        },
      });
      const errorMessage = file.errors?.[0]?.message;
      expect(file.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "This user isn't the owner of the file/project",
      );
    });

    it("gets all files by folderId", async () => {
      const tokenOtherUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const files = await client.mutate({
        mutation: GET_ALL_FILES_BY_FOLDER,
        context: {
          headers: {
            authorization: tokenOtherUser.data?.getTokenWithUser.token,
          },
        },
        variables: { folderId: parseInt(parentFolderId, 10) },
      });
      expect(files.data?.getAllFilesByFolderId.length).toBeGreaterThanOrEqual(
        1,
      );
    });

    it("fails to get all files by folderId without token", async () => {
      const files = await client.mutate({
        mutation: GET_ALL_FILES_BY_FOLDER,
        variables: { folderId: parseInt(parentFolderId, 10) },
      });
      const errorMessage = files.errors?.[0]?.message;
      expect(files.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to get all files by folderId with wrong folderId", async () => {
      const tokenOtherUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const files = await client.mutate({
        mutation: GET_ALL_FILES_BY_FOLDER,
        context: {
          headers: {
            authorization: tokenOtherUser.data?.getTokenWithUser.token,
          },
        },
        variables: { folderId: 9999 },
      });
      const errorMessage = files.errors?.[0]?.message;
      expect(files.errors).toHaveLength(1);
      expect(errorMessage).toBe("No folder found with this folderId");
    });

    it("gets all files by projectId", async () => {
      const tokenOtherUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const files = await client.mutate({
        mutation: GET_ALL_FILES_BY_PROJECT,
        context: {
          headers: {
            authorization: tokenOtherUser.data?.getTokenWithUser.token,
          },
        },
        variables: { projectId: parseInt(projectId, 10) },
      });
      expect(files.data?.getAllFilesByProjectId.length).toBeGreaterThanOrEqual(
        1,
      );
    });

    it("fails to get all files by projectId without token", async () => {
      const files = await client.mutate({
        mutation: GET_ALL_FILES_BY_PROJECT,
        variables: { projectId: parseInt(projectId, 10) },
      });
      const errorMessage = files.errors?.[0]?.message;
      expect(files.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to get all files by projectId with wrong projectId", async () => {
      const tokenOtherUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });
      const files = await client.mutate({
        mutation: GET_ALL_FILES_BY_PROJECT,
        context: {
          headers: {
            authorization: tokenOtherUser.data?.getTokenWithUser.token,
          },
        },
        variables: { projectId: 9999 },
      });
      const errorMessage = files.errors?.[0]?.message;
      expect(files.errors).toHaveLength(1);
      expect(errorMessage).toBe("No project found with this projectId");
    });

    it("fails to delete a file if the initiator isn't the owner", async () => {
      const tokenOtherUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
        },
      });

      const res = await client.mutate({
        mutation: DELETE_FILE,
        variables: {
          fileId: parseInt(fileId, 10),
        },
        context: {
          headers: {
            authorization: tokenOtherUser.data?.getTokenWithUser.token,
          },
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "This user isn't the owner of the file/project",
      );
    });

    it("deletes a file", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_FILE,
        variables: {
          fileId: parseInt(fileId, 10),
        },
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
      });
      expect(res.data?.deleteFile).toBe("File deleted");
    });

    it("fails to delete a file without token", async () => {
      const res = await client.mutate({
        mutation: DELETE_FILE,
        variables: {
          fileId: parseInt(fileId, 10),
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("fails to delete a file with a false idFile", async () => {
      const tokenOwnerProject = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_FILE,
        variables: {
          fileId: 9999,
        },
        context: {
          headers: {
            authorization: tokenOwnerProject.data?.getTokenWithUser.token,
          },
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No file found with this fileId");
    });
  });
};

export default fileTests;
