#!/usr/bin/env node
const { exec:dExec } = require("child_process");
const { prompt } = require("enquirer");
const { existsSync } = require("fs");
const { join } = require("path");
const exec = (cmd) => new Promise((resolve, reject) => {
  dExec(cmd, (err, stdout, stderr) => {
    if (err) {
      reject(err);
    } else {
      resolve(stdout);
    }
  });
});

const main = async () => {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
    process.on(signal, () => {
      process.exit(1);
    });
  });
  if (!existsSync(join(process.cwd(), ".git"))) {
    console.error("Not a git repository");
    process.exit(1);
  }
  const { type, message } = await prompt([
    {
      type: "select",
      name: "type",
      message: "Choose commit type",
      choices: [
        { name: "feat", message: "feat ✨", hint: "A new feature" },
        { name: "fix", message: "bug 🐛", hint: "A bug fix" },
        { name: "docs", message: "docs 📚", hint: "Documentation only changes" },
        { name: "style", message: "style 💄", hint: "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)" },
        { name: "refactor", message: "refactor 🔨", hint: "A code change that neither fixes a bug nor adds a feature" },
        { name: "perf", message: "perf ⚡️", hint: "A code change that improves performance" },
        { name: "test", message: "test 🧪", hint: "Adding missing tests" },
        { name: "chore", message: "chore 🤖", hint: "Changes to the build process or auxiliary tools and libraries such as documentation generation" },
        { name: "revert", message: "revert ⏪", hint: "Revert to a commit" },
        { name: "WIP", message: "WIP 🚧", hint: "Work in progress" },
        { name: "add", message: "add ➕", hint: "Add a file or content" },
        { name: "remove", message: "remove ➖", hint: "Remove a file or content" },
      ]
    },
    {
      type: "input",
      name: "message",
      message: "Commit message",
      validate: (value) => value.length > 1,
    }
  ]);
  console.log("Committing...");
  const res = await exec(`git commit -m "${type}: ${message}`);
  console.log(res);
};
main().catch((err) => {
  process.exit(1);
});