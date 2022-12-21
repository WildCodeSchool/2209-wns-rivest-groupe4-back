import { Field, ID, ObjectType } from "type-graphql";
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import File from "./file";
import Project from "./project";

@ObjectType()
@Entity()
export default class Folder {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.folders)
  project: Project;

  @Field(() => File)
  @OneToMany(() => File, (file) => file.folder)
  files: [File];
}