import { Field, ObjectType } from "type-graphql";
import User from "../entity/user";

@ObjectType()
export default class TokenWithUser {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}
