import testDataSource from "./dataSourceTest";
import Comment from "../../entities/comment";
import User from "../../entities/user";
import Folder from "../../entities/folder";
import File from "../../entities/file";
import Like from "../../entities/like";
import Project from "../../entities/project";
import Report from "../../entities/report";

const allEntities = [User, File, Folder, Like, Comment, Project, Report];

const clearAllEntities = async (): Promise<void> => {
  await testDataSource.initialize();
  await Promise.all(
    allEntities.map(
      async (entity) =>
        await testDataSource.manager
          .createQueryBuilder(entity, entity.name)
          .delete()
          .execute(),
    ),
  );
  await testDataSource.destroy();
};

export default clearAllEntities;
