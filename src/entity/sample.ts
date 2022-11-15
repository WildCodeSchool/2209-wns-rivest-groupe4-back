import {Field, ObjectType} from "type-graphql"
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@ObjectType()
@Entity()

export class Sample {
  @Field()
  @PrimaryGeneratedColumn()
  id: number

  @Field()
  @Column()
  sample: string
}