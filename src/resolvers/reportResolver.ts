import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import dataSource from "../dataSource";
import Project from "../entities/project";
import User from "../entities/user";
import Report from "../entities/report";

@Resolver(Report)
export default class ReportResolver {
  @Authorized()
  @Query(() => [Report])
  async getAllReports() {
    return await dataSource
      .getRepository(Report)
      .find({ relations: { project: true, user: true } });
  }

  @Authorized()
  @Mutation(() => Report)
  async addReport(
    @Ctx() context: { userFromToken: { userId: string; email: string } },
    @Arg("content") content: string,
    @Arg("idProject") idProject: number,
  ): Promise<Report> {
    const {
      userFromToken: { userId },
    } = context;

    const report = new Report();

    const projectToReport = await dataSource.getRepository(Project).findOne({
      where: { id: idProject },
      relations: { user: true },
    });

    if (content === "") {
      throw new Error("No empty comment");
    }

    if (projectToReport === null) {
      throw new Error("No project found with this idProject");
    }

    if (projectToReport.user.id === userId) {
      throw new Error("The owner of the project cannot report himself");
    }

    report.user = await dataSource.manager.getRepository(User).findOneByOrFail({
      id: userId,
    });

    report.content = content;
    report.project = projectToReport;

    try {
      const reportInBD = await dataSource.manager.save(Report, report);
      return reportInBD;
    } catch {
      throw new Error("Error while saving report");
    }
  }
}
