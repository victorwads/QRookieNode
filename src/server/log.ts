const MAX_LOG_COMMAND_OUTPUT_LINES = 20;

const log = {
  warn: (...args: any[]) => shouldWarn && console.log("\x1b[33m", ...args, "\x1b[0m"),
  error: (...args: any[]) => console.log("\x1b[31m", ...args, "\x1b[0m"),
  info: (...args: any[]) => shouldInfo && console.log(...args),
  userInfo: (...args: any[]) => console.log("\x1b[33m", ...args, "\x1b[0m"),
  debug: (...args: any[]) => shouldDebug && console.log("\x1b[35m", ...args, "\x1b[0m"),
  command: (command: string, args: string[], stdout: string, stderr: string) => {
    if (!shouldDebug) return;
    const stdoutLines = stdout.split("\n");
    console.log(
      "\n\x1b[32m<----------------------------------------",
      `\nCommand \x1b[33m'${command} ${args.join(" ")}'\x1b[32m executed\nstdout:\x1b[0m`,
      "\n\x1b[34m" + stdoutLines.slice(0, MAX_LOG_COMMAND_OUTPUT_LINES).join("\n") + "\x1b[0m",
      stdoutLines.length > 20
        ? `\n...and ${stdoutLines.length - MAX_LOG_COMMAND_OUTPUT_LINES} more lines`
        : "",
      stderr ? "\n\x1b[31mWith stderr: \n" + stderr + "\x1b[0m" : "",
      "\n\x1b[32m---------------------------------------->\x1b[0m"
    );
  },
  commandError: (command: string, args: string[], error: string) => {
    console.log(
      "\n\x1b[31m<----------------------------------------",
      `\nCommand '${command} ${args.join(" ")}' executed with error:`,
      "\n" + error,
      "\n---------------------------------------->\x1b[0m"
    );
  },
};

let shouldDebug = false;
let shouldWarn = false;
let shouldInfo = false;

const isVerbose = process.argv.includes("--verbose");
if (isVerbose || process.argv.includes("--debug")) {
  shouldDebug = true;
}
if (isVerbose || process.argv.includes("--warn")) {
  shouldWarn = true;
}
if (isVerbose || process.argv.includes("--info")) {
  shouldInfo = true;
}

export default log;
