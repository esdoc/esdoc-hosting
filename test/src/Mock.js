export class Request {
  constructor(obj) {
    for (let key in obj) {
      this[key] = obj[key];
    }
  }
}

export class Response {
  json(obj) {
    for (let key in obj) {
      this[key] = obj[key];
    }
  }
}
