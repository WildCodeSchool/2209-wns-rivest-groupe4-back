import { Arg, Query, Resolver } from "type-graphql";
import { exec } from "child_process";
import fs from "fs-extra";

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

const decodeBase64 = (data: string) => {
  return Buffer.from(data, "base64").toString("ascii");
};

@Resolver()
export default class CompilateurResolver {
  @Query(() => String)
  async postCode(@Arg("code") code: string): Promise<string> {
    try {
      fs.writeFile("./src/child-processes/code.js", decodeBase64(code));
    } catch {
      console.warn("error save file !");
    }
    const response = await execShellCommand(
      "node ./src/child-processes/code.js",
    );
    return response.replace("/n", "");
  }
}
