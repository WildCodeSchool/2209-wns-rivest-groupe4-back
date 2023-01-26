import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import fileRouter from "./src/file/file.router";

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT as string, 10);

app.use(cors());
app.use(bodyParser.json());

app.use("/compiler/file", fileRouter);

app.get("/", (req, res) => {
  res.send("Express + TypeScript Server");
});

app.listen(PORT, () => {
  console.warn(`[server]: Server is running at http://localhost:${PORT}`);
});
