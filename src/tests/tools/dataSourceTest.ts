import { DataSource } from "typeorm";
import Comment from "../../entities/comment";
import File from "../../entities/file";
import Folder from "../../entities/folder";
import Like from "../../entities/like";
import Project from "../../entities/project";
import Report from "../../entities/report";
import User from "../../entities/user";

const dataSourceTest = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5002,
  username: "postgres",
  password: "example",
  database: "postgres",
  synchronize: true,
  entities: [User, Project, Folder, File, Like, Comment, Report],
  logging: ["error"],
});

export default dataSourceTest;
