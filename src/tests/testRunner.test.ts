import projectTests from "./projectTests";
import userTests from "./userTests";

describe("Backend run tests", () => {
  userTests();
  projectTests();
});
