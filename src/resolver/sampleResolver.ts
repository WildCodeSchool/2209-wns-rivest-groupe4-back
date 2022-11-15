import { Query, Resolver } from 'type-graphql';
import { Sample } from '../entity/sample';

@Resolver(Sample)
export class SampleResover {
  @Query(() => String)
}