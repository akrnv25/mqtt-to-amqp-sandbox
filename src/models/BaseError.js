const isNil = require('../utilities/is-nil');

// We can instantiate the error in 2 ways:
// 1. Set the message, code, name and details of the error. We simply create a new error.
//    Params for this case: { message: string, code?: number, name?: string, details?: string[] }.
// 2. Set an origin error and details (message, name and code will be taken from the origin).
//    We forward the existing error to a higher level and at the same time replenish the stack of details.
//    Params for this case: { origin: Error, details?: string[] }.
class BaseError extends Error {
  name;
  code;
  detailsStack;
  isOperational;

  constructor(params) {
    const { message, code, name, details, origin } = params;
    let detailsStr;
    const isDetailsArray =
      !isNil(details?.length) && !!details.length && typeof details !== 'string';
    if (isDetailsArray) {
      const validDetails = details.filter(detail => typeof detail === 'string');
      if (!!validDetails.length) {
        detailsStr = details.join(', ');
      }
    }
    if (isNil(origin)) {
      super(message);
      this.name = name ?? 'BaseError';
      this.code = code ?? 400;
      this.detailsStack = !isNil(detailsStr) ? [detailsStr] : [];
      this.isOperational = true;
    } else {
      if (origin.isOperational) {
        super(origin.message);
        this.name = origin.name;
        this.code = origin.code;
        this.detailsStack = !isNil(detailsStr)
          ? [detailsStr, ...origin.detailsStack]
          : [...origin.detailsStack];
        this.isOperational = true;
      } else {
        super(origin.message);
        this.name = origin.name;
        this.code = 400;
        this.detailsStack = !isNil(detailsStr) ? [detailsStr] : [];
        this.isOperational = true;
      }
    }
  }
}

module.exports = BaseError;
