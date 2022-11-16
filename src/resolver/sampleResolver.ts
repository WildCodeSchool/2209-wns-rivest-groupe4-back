import { Arg, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { Sample } from "../entity/sample";

import dataSource from "../utils";

@InputType()
class AddSampleInput {
  @Field()
  sample?: string;

  @Field({ nullable: true })
  description?: string;
}

@Resolver(Sample)
export class SampleResolver {
  @Query(() => [Sample])
  async getAllSamples(): Promise<Sample[]> {
    return await dataSource.manager.find(Sample, {
      relations: {
      },
    });
  }

  @Mutation(() => Sample)
  async createSample(
    @Arg("data") newSampleData: AddSampleInput
  ): Promise<Sample> {
    const sampleFromDB = await dataSource.manager.save(Sample, newSampleData);
    return sampleFromDB;
  }
}