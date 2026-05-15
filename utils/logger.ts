export class Logger {
  static info(message: string) {
    console.log(`\x1b[36m[INFO]\x1b[0m ${message}`);
  }

  static success(message: string) {
    console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`);
  }

  static warn(message: string) {
    console.log(`\x1b[33m[WARN]\x1b[0m ${message}`);
  }

  static error(message: string) {
    console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`);
  }

  static step(message: string) {
    console.log(`\n\x1b[35m========== ${message} ==========\x1b[0m`);
  }
}