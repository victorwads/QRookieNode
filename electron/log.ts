const MAX_LOG_COMMAND_OUTPUT_LINES = 20;

const log = {
  warn: (...args: any[]) => console.log("\x1b[33m", ...args, "\x1b[0m"),
  error: (...args: any[]) => console.log("\x1b[31m", ...args, "\x1b[0m"),
  info: (...args: any[]) => console.log(...args),
  debug: (...args: any[]) => console.log("\x1b[35m", ...args, "\x1b[0m"),
  command: (command: string, args: string[], stdout: string, stderr: string) => {
    const stdoutLines = stdout.split("\n");
    console.log(
      "\n\x1b[32m<----------------------------------------",
      `\nCommand \x1b[33m'${command} ${args.join("")}'\x1b[32m executed\nstdout:\x1b[0m`,
      "\n\x1b[34m" + stdoutLines.slice(0, MAX_LOG_COMMAND_OUTPUT_LINES).join("\n") + "\x1b[0m",
      stdoutLines.length > 20 ? `\n...and ${stdoutLines.length - MAX_LOG_COMMAND_OUTPUT_LINES} more lines` : "",
      stderr ? "\n\x1b[31mWith stderr: \n" + stderr + "\x1b[0m" : "",
      "\n\x1b[32m---------------------------------------->\x1b[0m"
    );
  },
  commandError: (command: string, args: string[], error: string) => {
    console.log(
      "\n\x1b[31m<----------------------------------------",
      `\nCommand '${command} ${args.join("")}' executed with error:`,
      "\n" + error,
      "\n---------------------------------------->\x1b[0m"
    );
  }
};

export default log;
