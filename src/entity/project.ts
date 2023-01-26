import { Field, ID, ObjectType } from "type-graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import Comment from "./comment";
import Folder from "./folder";
import Like from "./like";
import Report from "./report";
import User from "./user";

@ObjectType()
@Entity()
export default class Project {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Boolean)
  @Column()
  public: boolean;

  @Field(() => String)
  @Column({ default: false })
  name: string;

  @Field(() => String)
  @Column()
  description: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Folder)
  @OneToMany(() => Folder, (folder) => folder.project)
  folders: [Folder];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.projects)
  user: User;

  @Field(() => Like)
  @OneToMany(() => Like, (like) => like.project)
  likes: Like[];

  @Field(() => Comment)
  @OneToMany(() => Comment, (comment) => comment.project)
  comments: Comment[];

  @Field(() => Report)
  @OneToMany(() => Report, (report) => report.project)
  reports: Report[];
}
