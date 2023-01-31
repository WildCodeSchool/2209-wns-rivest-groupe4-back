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

  @Field(() => [Folder], { nullable: true })
  @ManyToOne(() => Folder, (folder) => folder.parentFolder, {
    onDelete: "CASCADE",
  })
  parentFolder?: Folder;

  @Field(() => Project)
  @ManyToOne(() => Project, (project) => project.folders, {
    onDelete: "CASCADE",
  })
  project: Project;

  @Field(() => File)
  @OneToMany(() => File, (file) => file.folder, { onDelete: "CASCADE" })
  files: [File];
}
