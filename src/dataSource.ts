import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import Comment from "./entities/comment";
import File from "./entities/file";
import Folder from "./entities/folder";
import Like from "./entities/like";
import Project from "./entities/project";
import Report from "./entities/report";
import User from "./entities/user";

dotenv.config();
const dbHost = process.env.DB_NAME === "db-test" ? "db-test" : "db";
const dataSource = new DataSource({
  type: "postgres",
  host: dbHost,
  port: 5432,
  username: "postgres",
  password: "example",
  database: "postgres",
  synchronize: true,
  entities: [User, Project, Folder, File, Like, Comment, Report],
  logging: ["error"],
});

export default dataSource;
