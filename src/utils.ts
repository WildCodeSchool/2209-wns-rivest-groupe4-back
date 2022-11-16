import { DataSource } from "typeorm";
import { Sample } from './entity/sample';

const dataSource = new DataSource({
  type: "postgres",
  host: "db",
  port: 5432,
  username: "postgres",
  password: "example",
  database: "postgres",
  synchronize: true,
  entities: [Sample],
  logging: ['error'],
});

export default dataSource;