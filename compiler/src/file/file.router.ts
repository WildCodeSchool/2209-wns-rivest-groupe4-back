/* eslint-disable no-restricted-syntax */
import express, { Request, Response } from "express";
import { exec } from "child_process";
import fs from "fs-extra";

const execShellCommand = (cmd: string) => {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error || stderr) {
        console.warn(error || stderr);
        reject();
      }
      console.log("STDOUT", stdout);
      resolve(stdout);
    });
  });
};

const fileRouter = express.Router();

const decodeBase64 = (data: string) => {
  return Buffer.from(data, "base64").toString("ascii");
};

fileRouter.post("/", async (req: Request, res: Response) => {
  const fileContent: string = req.body.content;
  try {
    fs.outputFile("../files/code.js", decodeBase64(fileContent));
  } catch (error) {
    return res.status(500).send(error);
  }
  try {
    const codeResult: string = await execShellCommand("node ../files/code.js");
    return res.status(200).send(codeResult);
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default fileRouter;
