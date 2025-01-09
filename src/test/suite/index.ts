import * as path from "path";
import * as Mocha from "mocha";
import * as glob from "glob";

export function run(): Promise<void> {
  // 创建 mocha 测试实例
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    timeout: 60000,
  });

  const testsRoot = path.resolve(__dirname, ".");

  return new Promise((resolve, reject) => {
    glob("**/**.test.js", { cwd: testsRoot }, (err, files) => {
      if (err) {
        return reject(err);
      }

      // 添加所有的测试文件
      files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // 运行测试
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}
