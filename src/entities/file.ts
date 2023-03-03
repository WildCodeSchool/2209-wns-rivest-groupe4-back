import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Folder from "./folder";

@ObjectType()
@Entity()
export default class File {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  content: string;

  @Field(() => String)
  @Column()
  extension: string;

  @Field(() => Folder)
  @ManyToOne(() => Folder, (folder) => folder.files, { onDelete: "CASCADE" })
  folder: Folder;
}
