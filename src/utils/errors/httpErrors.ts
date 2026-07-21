export class BadRequestError extends Error {
  statusCode = 400

  constructor(message: string) {
    super(message)
    this.name = 'BadRequestError'
  }
}

export class NotFoundError extends Error {
  statusCode = 404

  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class InternalServerError extends Error {
  statusCode = 500

  constructor(message: string) {
    super(message)
    this.name = 'InternalServerError'
  }
}
