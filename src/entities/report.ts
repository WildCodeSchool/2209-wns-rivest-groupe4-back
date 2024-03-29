import { Field, ID, ObjectType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Project from "./project";
import User from "./user";

@ObjectType()
@Entity()
export default class Report {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  content: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.reports, { onDelete: "CASCADE" })
  user: User;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.reports, {
    onDelete: "CASCADE",
  })
  project: Project;
}
