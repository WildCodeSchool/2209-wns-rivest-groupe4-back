import { Field, ID, ObjectType } from "type-graphql";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Project from "./project";
import User from "./user";

@ObjectType()
@Entity()
export default class Like {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.likes)
  user: User;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.likes)
  project: Project;
}
