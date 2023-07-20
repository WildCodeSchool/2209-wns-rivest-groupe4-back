import { Field, ID, ObjectType } from "type-graphql";
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Project from "./project";
import User from "./user";

@ObjectType()
@Entity()
export default class Like {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
  user: User;

  @Field()
  @CreateDateColumn()
  date: Date;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.likes, { onDelete: "CASCADE" })
  project: Project;
}
