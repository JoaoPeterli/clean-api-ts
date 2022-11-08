import { HttpResponse , HttpRequest } from "../protocols/http"
import { MissingParamError } from "../erros/missing-params-error"
import { badRequest } from "../helpers/http-helper"
import { Controller } from "../protocols/controller"
import { EmailValidator } from '../protocols/email-validator'
import { InvalidParamError } from "../erros/invalid-params.error"

export class SignUpController {
  private readonly emailValidator: EmailValidator

  constructor (emailValidator: EmailValidator) {
    this.emailValidator = emailValidator 
  }

  handle(httpRequest: HttpRequest): HttpResponse {
    const requiredFields = ['name', 'email', 'password', 'passwordConfirmation'] 
    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }
    const isValid = this.emailValidator.isValid(httpRequest.body.email)
    if (!isValid) {
      return badRequest(new InvalidParamError('email'))
    }
    
  }
}