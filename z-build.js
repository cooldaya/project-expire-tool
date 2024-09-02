import * as esbuild from "esbuild";
import JavaScriptObfuscator from "javascript-obfuscator";
import fs from "node:fs";

// 打包并混淆
const buildAndObfuscate = (config = {}) => {
  const { outfile } = config;
  esbuild
    .build({
      bundle: true,
      minify: true,
      sourcemap: false,
      ...config,
    })
    .then((res) => {
      // 读取打包后的文件
      const code = fs.readFileSync(outfile, "utf8");
      const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: true,
        stringArray: true,
        selfDefending: true,
        stringArrayRotate: true,
        disableConsoleOutput:true,
      });
      // 将混淆后的代码写入输出文件
      fs.writeFileSync(outfile, obfuscationResult.getObfuscatedCode());

      console.log("Obfuscation complete.");
    });
};

buildAndObfuscate({
  entryPoints: ["main.js"],
  outfile: "dist/a-verify.js",
});

buildAndObfuscate({
  entryPoints: ["src/aesUtil.js"],
  outfile: "dist/aes-util.js",
});

