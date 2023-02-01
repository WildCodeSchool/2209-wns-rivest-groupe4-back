import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

import User from "../entity/user";
import dataSource from "../dataSource";
import Validate from "../utils/regex";
import TokenWithUser from "../types/tokenWithUser";

@Resolver(User)
export default class UserResolver {
  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return await dataSource.manager.find(User);
  }

  @Query(() => [User])
  async getOneUser(@Arg("id") id: string): Promise<User> {
    return await dataSource.manager.getRepository(User).findOneByOrFail({
      id,
    });
  }

  @Query(() => TokenWithUser)
  async getTokenWithUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
  ): Promise<TokenWithUser> {
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
        return { token, user: userFromDB };
      } else {
        throw new Error();
      }
    } catch {
      throw new Error("Invalid Auth");
    }
  }

  @Mutation(() => String)
  async createUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("pseudo") pseudo: string,
  ): Promise<string> {
    try {
      if (
        !Validate.email(email) ||
        !Validate.password(password) ||
        !Validate.pseudo(pseudo)
      ) {
        throw Error("Invalid email, password or pseudo");
      }
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const newUser = new User();
      newUser.email = email;
      newUser.hashedPassword = await argon2.hash(password);
      newUser.pseudo = pseudo;
      const userFromDB = await dataSource.manager.save(User, newUser);

      const token = jwt.sign(
        { email: userFromDB.email },
        process.env.JWT_SECRET_KEY,
      );
      return token;
    } catch (error) {
      throw new Error("Error try again with an other email or pseudo");
    }
  }

  @Mutation(() => String)
  async modifyUser(
    @Arg("id") id: string,
    @Arg("email", { nullable: true }) email?: string,
    @Arg("password", { nullable: true }) password?: string,
    @Arg("pseudo", { nullable: true }) pseudo?: string,
  ): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const userToUpdate = await dataSource.manager
        .getRepository(User)
        .findOneByOrFail({
          id,
        });

      if (pseudo != null) {
        if (!Validate.pseudo(pseudo)) {
          throw Error("Invalid pseudo");
        } else {
          userToUpdate.pseudo = pseudo;
        }
      }
      if (password != null) {
        if (!Validate.password(password)) {
          throw Error("Invalid password");
        } else {
          userToUpdate.hashedPassword = await argon2.hash(password);
        }
      }
      if (email != null) {
        if (!Validate.email(email)) {
          throw Error("Invalid email");
        } else {
          userToUpdate.email = email;
        }
      }

      const userFromDB = await dataSource.manager.save(User, userToUpdate);

      const token = jwt.sign({ ...userFromDB }, process.env.JWT_SECRET_KEY);
      return token;
    } catch (error) {
      throw new Error("Error try again with an other email or pseudo");
    }
  }
}
