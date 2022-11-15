import { DataSource } from "typeorm";

const dataSource = new DataSource({
  type: "postgres",
  host: "db",
  port: 5000,
  username: "postgres",
  password: "example",
  database: "postgres",
  synchronize: true,
  entities: [],
});

export default dataSource;