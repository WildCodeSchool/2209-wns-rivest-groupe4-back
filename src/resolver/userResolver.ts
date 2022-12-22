import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

import User from "../entity/user";
import dataSource from "../dataSource";
import { Validate } from "../utils/regex";

@Resolver(User)
export default class UserResolver {
  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return await dataSource.manager.find(User);
  }

  @Query(() => String)
  async getToken(
    @Arg("email") email: string,
    @Arg("password") password: string,
  ): Promise<string> {
    try {
      const userFromDB = await dataSource.manager.findOneByOrFail(User, {
        email,
      });
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      if (await argon2.verify(userFromDB.hashedPassword, password)) {
        const token = jwt.sign(
          { email: userFromDB.email },
          process.env.JWT_SECRET_KEY,
        );
        return token;
      } else {
        throw new Error();
      }
    } catch {
      throw new Error("Invalid Auth");
    }
  }

  @Mutation(() => User)
  async createUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("pseudo") pseudo: string,
  ): Promise<User> {
    try {
      if (
        !Validate.email(email) ||
        !Validate.password(password) ||
        !Validate.pseudo(pseudo)
      ) {
        throw Error("Invalid email, password or pseudo");
      }
      const newUser = new User();
      newUser.email = email;
      newUser.hashedPassword = await argon2.hash(password);
      newUser.pseudo = pseudo;
      const userFromDB = await dataSource.manager.save(User, newUser);
      return userFromDB;
    } catch (error) {
      throw new Error("Error try again with an other email or pseudo");
    }
  }
}
