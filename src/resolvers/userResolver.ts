import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import User from "../entities/user";
import dataSource from "../dataSource";
import Validate from "../utils/regex";
import TokenWithUser from "../types/tokenWithUser";

@Resolver(User)
export default class UserResolver {
  @Authorized()
  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return await dataSource.manager.find(User);
  }

  @Authorized()
  @Query(() => User)
  async getOneUser(@Arg("id") id: string): Promise<User> {
    const user = await dataSource.manager.getRepository(User).findOneByOrFail({
      id,
    });

    if (user != null) {
      return user;
    } else {
      throw new Error("User not found...");
    }
  }

  @Query(() => TokenWithUser)
  async getTokenWithUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
  ): Promise<TokenWithUser> {
    let userFromDB;
    try {
      userFromDB = await dataSource.manager.findOneByOrFail(User, {
        email: email.toLocaleLowerCase(),
      });
    } catch {
      throw new Error("No user matches with this email...");
    }
    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new Error("Invalid access, check your rights");
    }
    if (await argon2.verify(userFromDB.hashedPassword, password)) {
      const token = jwt.sign(
        { email: userFromDB.email, userId: userFromDB.id },
        process.env.JWT_SECRET_KEY,
      );
      return { token, user: userFromDB };
    } else {
      throw new Error("Wrong password for this user");
    }
  }

  @Mutation(() => TokenWithUser)
  async createUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("pseudo") pseudo: string,
  ): Promise<TokenWithUser> {
    if (!Validate.email(email)) {
      throw new Error("Invalid email");
    }
    if (!Validate.password(password)) {
      throw new Error(
        "Invalid password: must be one uppercase letter, one lowercase letter and one number. Be at min 8 and max 25 characters long. Accept special character.",
      );
    }
    if (!Validate.pseudo(pseudo)) {
      throw new Error("Invalid pseudo: only letters and numbers");
    }

    const userWithSameEmail = await dataSource.manager.findOneBy(User, {
      email: email.toLocaleLowerCase(),
    });

    if (userWithSameEmail != null) {
      throw new Error("Email already used");
    }

    const userWithSamePseudo = await dataSource.manager.findOneBy(User, {
      pseudo,
    });

    if (userWithSamePseudo != null) {
      throw new Error("Pseudo already used");
    }

    const newUser = new User();
    newUser.email = email.toLowerCase();
    newUser.hashedPassword = await argon2.hash(password);
    newUser.pseudo = pseudo;
    const userFromDB = await dataSource.manager.save(User, newUser);

    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new Error("Invalid access, check your rights");
    } else {
      const token = jwt.sign(
        { email: userFromDB.email, id: userFromDB.id },
        process.env.JWT_SECRET_KEY,
      );
      return { token, user: userFromDB };
    }
  }

  @Authorized()
  @Mutation(() => TokenWithUser)
  async modifyUser(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("email", { nullable: true }) email?: string,
    @Arg("password", { nullable: true }) password?: string,
    @Arg("pseudo", { nullable: true }) pseudo?: string,
  ): Promise<TokenWithUser> {
    const {
      userFromToken: { userId },
    } = context;

    let userToUpdate;
    try {
      userToUpdate = await dataSource.manager
        .getRepository(User)
        .findOneByOrFail({
          id: userId,
        });
    } catch {
      throw new Error("User not found...");
    }

    if (pseudo != null) {
      if (!Validate.pseudo(pseudo)) {
        throw new Error("Invalid pseudo: only letters and numbers");
      } else {
        userToUpdate.pseudo = pseudo;
      }
    }
    if (password != null) {
      if (!Validate.password(password)) {
        throw new Error(
          "Invalid password: must be one uppercase letter, one lowercase letter and one number. Be at min 8 and max 25 characters long. Accept special character.",
        );
      } else {
        userToUpdate.hashedPassword = await argon2.hash(password);
      }
    }
    if (email != null) {
      if (!Validate.email(email)) {
        throw new Error("Invalid email");
      } else {
        userToUpdate.email = email;
      }
    }

    let userFromDB;
    try {
      userFromDB = await dataSource.manager.save(User, userToUpdate);
    } catch {
      throw new Error("Error while saving new data on this user");
    }
    if (process.env.JWT_SECRET_KEY === undefined) {
      throw new Error("Invalid access, check your rights");
    } else {
      const token = jwt.sign(
        { email: userFromDB.email, id: userFromDB.id },
        process.env.JWT_SECRET_KEY,
      );
      return { token, user: userFromDB };
    }
  }

  @Authorized()
  @Mutation(() => String)
  async deleteUser(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
  ): Promise<string> {
    const {
      userFromToken: { userId },
    } = context;
    const userToDelete = await dataSource.manager
      .getRepository(User)
      .findOneByOrFail({
        id: userId,
      });
    try {
      await dataSource.manager.getRepository(User).remove(userToDelete);
      return `User deleted`;
    } catch (error) {
      throw new Error("Error while deleting user");
    }
  }
}
