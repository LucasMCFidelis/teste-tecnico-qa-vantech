export abstract class HttpError extends Error {
  abstract statusCode: number

  constructor(message: string) {
    super(message)
    this.name = new.target.name

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class BadRequestError extends HttpError {
  statusCode = 400
}

export class UnauthorizedError extends HttpError {
  statusCode = 401
}

export class NotFoundError extends HttpError {
  statusCode = 404
}

export class ConflictError extends HttpError {
  statusCode = 409
}

export class GoneError extends HttpError {
  statusCode = 410
}

export class InternalServerError extends HttpError {
  statusCode = 500
}
