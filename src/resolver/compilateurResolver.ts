import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { exec, execFile, ChildProcess } from "child_process";
import { Any, ChildEntity } from "typeorm";

function execShellCommand(cmd: string) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error || stderr) {
        console.warn(error);
        reject();
      }
      resolve(stdout);
    });
  });
}

@Resolver()
export default class CompilateurResolver {
  @Query(() => String)
  async postCode(@Arg("code") code: string): Promise<string> {
    const response = await execShellCommand(
      "node ./src/child-processes/code.js",
    );
    return response;
  }
}
