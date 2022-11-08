import { HttpResponse , HttpRequest } from "../protocols/http"
import { MissingParamError } from "../erros/missing-params-error"
import { badRequest } from "../helpers/http-helper"
import { Controller } from "../protocols/controller"

export class SignUpController {
  handle(httpRequest: HttpRequest): HttpResponse {
    const requiredFields = ['name', 'email', 'password', 'passwordConfirmation'] 
    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }
  }
}