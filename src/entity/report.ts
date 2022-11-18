import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "./project";
import { User } from "./user";

@ObjectType()
@Entity()
export class Report {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  comment: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.reports)
  user: User;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.reports)
  project: Project;
}
