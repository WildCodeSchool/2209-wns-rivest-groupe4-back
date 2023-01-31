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
export default class Comment {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  comment: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.comments, {
    onDelete: "CASCADE",
  })
  project: Project;
}
