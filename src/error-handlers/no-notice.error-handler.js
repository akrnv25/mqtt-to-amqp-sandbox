const loggerService = require('../services/logger.service');
const BaseError = require('../models/BaseError');

function noNoticeErrorHandler(err) {
  const error = new BaseError({ origin: err });
  const { message, code, name, detailsStack } = error;
  loggerService.error(`${name}: ${message}. Details: ${detailsStack.join('; ')} (${code})`);
}

module.exports = noNoticeErrorHandler;
