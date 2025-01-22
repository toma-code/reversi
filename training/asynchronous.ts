import fs from "fs";
import util from "util";

const promisifyReadFile = util.promisify(fs.readFile);

const main = async () => {
  let fileContent = "Not loaded";
  const data = await promisifyReadFile("package.json");
  fileContent = data.toString();
  console.log(fileContent);
};

main();
