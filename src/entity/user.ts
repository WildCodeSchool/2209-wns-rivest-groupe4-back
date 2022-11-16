import { Field, ID, Int, ObjectType } from 'type-graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()

export class User {
  @Field(type => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Field()
  @Column({unique: true})
  email: string

  @Field()
  @Column()
  hashedPassword: string

  @Field()
  @Column({default: false})
  premium: boolean

  @Field()
  @Column({unique: true})
  pseudo: string

  @Field(type => Int)
  @Column({default: 0})
  dailyRuns: number
}