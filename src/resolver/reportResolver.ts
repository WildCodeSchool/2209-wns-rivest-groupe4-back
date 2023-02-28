import { Arg, Mutation, Query, Resolver } from "type-graphql";

import dataSource from "../dataSource";
import Project from "../entity/project";
import User from "../entity/user";
import Report from "../entity/report";

@Resolver(Report)
export default class ReportResolver {
  @Query(() => [Report])
  async getAllReports() {
    const response = await dataSource.getRepository(Report).find();
    console.warn(response);
    return await dataSource.getRepository(Report).find();
  }

  @Mutation(() => String)
  async addReport(
    @Arg("idUser") idUser: string,
    @Arg("comment") comment: string,
    @Arg("idProject") idProject: number,
  ): Promise<string> {
    try {
      if (process.env.JWT_SECRET_KEY === undefined) {
        throw new Error();
      }

      const report = new Report();
      report.project = await dataSource.manager
        .getRepository(Project)
        .findOneByOrFail({
          id: idProject,
        });
      report.user = await dataSource.manager
        .getRepository(User)
        .findOneByOrFail({
          id: idUser,
        });
      report.comment = comment;

      await dataSource.manager.save(Report, report);

      return `Report saved`;
    } catch (error) {
      throw new Error("Error: try again with an other user or project");
    }
  }
}
