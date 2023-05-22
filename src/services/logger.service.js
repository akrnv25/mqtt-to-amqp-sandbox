const winston = require('winston');
const { format } = require('winston');
const { combine, timestamp } = winston.format;
const config = require('../config');
const isNil = require('../utilities/is-nil');

class LoggerService {
  constructor() {
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      success: 3,
      highlight: 4,
      debug: 5,
      base: 6
    };

    const colors = {
      error: '\u001b[1;31m',
      warn: '\u001b[1;35m',
      info: '\u001b[1;36m',
      success: '\u001b[1;32m',
      highlight: '\x1b[7m\u001b[1;33m',
      debug: '\u001b[1;33m',
      base: '\u001B[37m'
    };

    const transports = [new winston.transports.Console()];
    if (config.logger.writeToFile) {
      const fileTransport = new winston.transports.File({
        filename: config.logger.fileName,
        level: 'base'
      });
      transports.push(fileTransport);
    }

    const prepareMessage = format(info => {
      const { level, message, timestamp } = info;
      if (isNil(levels[level])) {
        throw new Error(`Logger level "${level}" is not found`);
      }
      const details = info[Symbol.for('splat')] ?? [];
      const validDetails = details
        .map(detail => detail?.toString())
        .filter(detail => typeof detail === 'string');
      const messageWithDetails = [message, ...validDetails].join(', ');
      // prettier-ignore
      info[Symbol.for('message')] = `${colors[level]}[${timestamp} ${level.toUpperCase()}]\x1b[0m ${messageWithDetails}`;
      return info;
    });

    const logger = winston.createLogger({
      colorize: true,
      prettyPrint: true,
      levels: levels,
      level: 'base',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), prepareMessage()),
      transports: transports
    });

    this.error = logger.error.bind(logger);
    this.warn = logger.warn.bind(logger);
    this.info = logger.info.bind(logger);
    this.success = logger.success.bind(logger);
    this.highlight = logger.highlight.bind(logger);
    this.debug = logger.debug.bind(logger);
    this.base = logger.base.bind(logger);
  }
}

module.exports = new LoggerService();
