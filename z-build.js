import * as esbuild from "esbuild";
import JavaScriptObfuscator from "javascript-obfuscator";
import fs from "node:fs";

//打包配置
const buildConfig = {
  entryPoints: ["src/aes-util.js", "src/a-verify.js"],
  bundle: true,
  minify: true,
  sourcemap: false,
  write: false,
  outdir: "public",
};

// 混淆配置
const confoundConfig = {
  compact: true,
  controlFlowFlattening: true,
  stringArray: true,
  selfDefending: true,
  stringArrayRotate: true,
  disableConsoleOutput: true,
};

esbuild.build(buildConfig).then((res) => {
  const outputFiles = res.outputFiles || [];
  outputFiles.forEach((fileInfo, index) => {
    const { text, path } = fileInfo;
    const obfuscationResult = JavaScriptObfuscator.obfuscate(
      text,
      confoundConfig
    );
    fs.writeFileSync(path, obfuscationResult.getObfuscatedCode());
    console.log(`${index + 1}/${outputFiles.length} Obfuscating ${path}...`);
  });
});
