import client from "./tools/clientUtil";
import clearAllEntities from "./tools/setupDB";
import {
  CREATE_USER,
  DELETE_USER,
  GET_ALL_USERS,
  GET_ONE_USER,
  GET_TOKEN,
  MODIFY_USER,
} from "./tools/gql";

import {
  testUserData,
  testUserData2,
  testUserData3,
  testUserData4,
} from "./data/users";

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/;

const jwtRegex = /[a-zA-Z0-9-_=]+\.[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_.+/=]*/;

const userTests = () => {
  describe("User resolver", () => {
    beforeAll(async () => {
      await clearAllEntities();
    });
    it("creates a user", async () => {
      const res = await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
          pseudo: testUserData.pseudo,
        },
      });
      expect(res.data?.createUser).toMatchObject({
        user: {
          email: testUserData.email,
          pseudo: testUserData.pseudo,
        },
      });
      expect(res.data?.createUser.user.id).toMatch(uuidRegex);
    });

    it("fails to create a user if the email is already taken", async () => {
      const res = await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData.email,
          password: testUserData2.password,
          pseudo: testUserData2.pseudo,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("Email already used");
    });

    it("fails to create a user if the pseudo is already taken", async () => {
      const res = await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData2.email,
          password: testUserData2.password,
          pseudo: testUserData.pseudo,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("Pseudo already used");
    });

    it("fails to create a user if the password format is incorrect", async () => {
      const res = await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData4.email,
          password: "test",
          pseudo: testUserData4.pseudo,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Invalid password: must be one uppercase letter, one lowercase letter and one number. Be at min 8 and max 25 characters long. Accept special character.",
      );
    });

    it("fails to create a user if the email format is incorrect", async () => {
      const res = await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: "test",
          password: testUserData4.password,
          pseudo: testUserData4.pseudo,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("Invalid email");
    });

    it("fails to create a user if the pseudo format is incorrect", async () => {
      const res = await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData4.email,
          password: testUserData4.password,
          pseudo: "/?./ZhFHOD",
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("Invalid pseudo: only letters and numbers");
    });

    it("gets a token", async () => {
      const res = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      expect(res.data?.getTokenWithUser.token).toMatch(jwtRegex);
    });

    it("fails to get a token with wrong password", async () => {
      const res = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData2.password,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("Wrong password for this user");
    });

    it("fails to get a token when user email is not found", async () => {
      const res = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData2.email,
          password: testUserData.password,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe("No user matches with this email...");
    });

    it("updates a user", async () => {
      const tokenUser = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const userUpdated = await client.mutate({
        mutation: MODIFY_USER,
        context: {
          headers: {
            authorization: tokenUser.data?.getTokenWithUser.token,
          },
        },
        variables: {
          pseudo: "NEWPSEUDO",
        },
      });

      expect(userUpdated.data).toMatchObject({
        modifyUser: {
          user: {
            email: testUserData.email,
            pseudo: "NEWPSEUDO",
          },
        },
      });
    });

    it("fails to update a user when the pseudo format is invalid", async () => {
      const tokenUserToModify = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const userUpdated = await client.mutate({
        mutation: MODIFY_USER,
        context: {
          headers: {
            authorization: tokenUserToModify.data?.getTokenWithUser.token,
          },
        },
        variables: {
          pseudo: ";/./SDJQSJ",
        },
      });

      const errorMessage = userUpdated.errors?.[0]?.message;
      expect(userUpdated.errors).toHaveLength(1);
      expect(errorMessage).toBe("Invalid pseudo: only letters and numbers");
    });

    it("fails to update a user when the email format is invalid", async () => {
      const tokenUserToModify = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const userUpdated = await client.mutate({
        mutation: MODIFY_USER,
        context: {
          headers: {
            authorization: tokenUserToModify.data?.getTokenWithUser.token,
          },
        },
        variables: {
          modifyUserId: tokenUserToModify.data?.getTokenWithUser.user.id,
          email: "test",
        },
      });

      const errorMessage = userUpdated.errors?.[0]?.message;
      expect(userUpdated.errors).toHaveLength(1);
      expect(errorMessage).toBe("Invalid email");
    });

    it("fails to update a user when the password format is invalid", async () => {
      const tokenUserToModify = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      const userUpdated = await client.mutate({
        mutation: MODIFY_USER,
        context: {
          headers: {
            authorization: tokenUserToModify.data?.getTokenWithUser.token,
          },
        },
        variables: {
          modifyUserId: tokenUserToModify.data?.getTokenWithUser.user.id,
          password: "test",
        },
      });

      const errorMessage = userUpdated.errors?.[0]?.message;
      expect(userUpdated.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Invalid password: must be one uppercase letter, one lowercase letter and one number. Be at min 8 and max 25 characters long. Accept special character.",
      );
    });

    it("gets one user", async () => {
      const tokenUserToGet = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });

      await client.mutate({
        mutation: CREATE_USER,
        variables: {
          email: testUserData4.email,
          password: testUserData4.password,
          pseudo: testUserData4.pseudo,
        },
      });

      const tokenUserWhoGet = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData4.email,
          password: testUserData4.password,
        },
      });

      const res = await client.query({
        query: GET_ONE_USER,
        context: {
          headers: {
            authorization: tokenUserWhoGet.data?.getTokenWithUser.token,
          },
        },
        variables: {
          getOneUserId: tokenUserToGet.data?.getTokenWithUser.user.id,
        },
      });
      expect(res.data?.getOneUser.pseudo).toBe("NEWPSEUDO");
    });

    it("fails to get one user without token", async () => {
      const tokenUserToGet = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.query({
        query: GET_ONE_USER,
        variables: {
          getOneUserId: tokenUserToGet.data?.getTokenWithUser.user.id,
        },
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("gets all users", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.query({
        query: GET_ALL_USERS,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
      });
      expect(res.data?.getAllUsers.length).toBeGreaterThanOrEqual(1);
    });

    it("fails to get all users without token", async () => {
      const res = await client.query({
        query: GET_ALL_USERS,
      });
      const errorMessage = res.errors?.[0]?.message;
      expect(res.errors).toHaveLength(1);
      expect(errorMessage).toBe(
        "Access denied! You need to be authorized to perform this action!",
      );
    });

    it("deletes a user", async () => {
      const tokenRes = await client.mutate({
        mutation: GET_TOKEN,
        variables: {
          email: testUserData.email,
          password: testUserData.password,
        },
      });
      const res = await client.mutate({
        mutation: DELETE_USER,
        context: {
          headers: {
            authorization: tokenRes.data?.getTokenWithUser.token,
          },
        },
      });
      expect(res.data?.deleteUser).toBe("User deleted");
    });
  });
};

export default userTests;
