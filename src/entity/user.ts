import { Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Comment } from "./comment";
import { Like } from "./like";
import { Project } from "./project";
import { Report } from "./report";

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Field(() => String)
  @Column({ unique: true })
  pseudo: string;

  @Field(() => String)
  @Column()
  hashedPassword: string;

  @Field(() => Boolean)
  @Column({ default: false })
  premium: boolean;

  @Field(() => Int)
  @Column({ default: 0 })
  dailyRuns: number;

  @Field(() => [Project])
  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @Field(() => [Like])
  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Field(() => [Report])
  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

}
