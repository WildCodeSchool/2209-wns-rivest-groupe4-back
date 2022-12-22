import { DataSource } from "typeorm";
import Comment from "./entity/comment";
import File from "./entity/file";
import Folder from "./entity/folder";
import Like from "./entity/like";
import Project from "./entity/project";
import Report from "./entity/report";
import User from "./entity/user";

const dataSource = new DataSource({
  type: "postgres",
  host: "db",
  port: 5432,
  username: "postgres",
  password: "example",
  database: "postgres",
  synchronize: true,
  entities: [User, Project, Folder, File, Like, Comment, Report],
  logging: [],
});

export default dataSource;
