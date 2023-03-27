import commentTests from "./commentTests";
import fileTests from "./fileTests";
import folderTests from "./folderTests";
import likeTests from "./likeTests";
import projectTests from "./projectTests";
import reportTests from "./reportTests";
import userTests from "./userTests";

describe("Backend run tests", () => {
  userTests();
  projectTests();
  likeTests();
  commentTests();
  reportTests();
  folderTests();
  fileTests();
});
