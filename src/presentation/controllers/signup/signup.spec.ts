import { SignUpController } from "./signup"
import { MissingParamError, ServerError, InvalidParamError } from "../../errors"
import {AddAccount, AddAccountModel, AccountModel, EmailValidator, HttpRequest, Validation } from './signup-protocols'
import { badRequest } from "../../helpers/http-helper";

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true; 
    }
  }
  return  new EmailValidatorStub()
}

const makeAddAccount = ():  AddAccount => {
  class AddAccountStub implements AddAccount {
    async add (account: AddAccountModel): Promise<AccountModel> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }
  }
  return new AddAccountStub()
}

const makeValidation = ():  Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error{
      return null
    }
  }
  return new ValidationStub()
}

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password',
    passwordConfirmation: 'any_password' 
  }
})

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub: AddAccount
  validationStub: Validation

}

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator ()
  const addAccountStub = makeAddAccount()
  const validationStub = makeValidation()
  const sut = new SignUpController(emailValidatorStub, addAccountStub, validationStub)
  return {
    sut, 
    emailValidatorStub,
    addAccountStub,
    validationStub
  }
}

describe('SignUp Controller', () => {
  test('Should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidatorStub } = makeSut() 
    jest.spyOn(emailValidatorStub, "isValid").mockReturnValueOnce(false)
    const httResponse = await sut.handle(makeFakeRequest())    
    expect(httResponse.statusCode).toBe(400)
    expect(httResponse.body).toEqual(new InvalidParamError('email') )
  })

  test('Should return 400 if password confirmation  fails', async () => {
    const { sut } = makeSut() 
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'invalid_password' 
      }
     }
    const httResponse = await sut.handle(httpRequest)    
    expect(httResponse.statusCode).toBe(400)
    expect(httResponse.body).toEqual(new InvalidParamError('passwordConfirmation') )
  })

  test('Should return 500 if EmailValidator throws', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid'). mockImplementationOnce(() => {
        throw new Error()
    }) 
    const httResponse = await sut.handle(makeFakeRequest())    
    expect(httResponse.statusCode).toBe(500)
    expect(httResponse.body).toEqual(new ServerError(null))
  })
 
  test('Should return 500 if AddAccount throws', async () => {
    const { sut, addAccountStub } = makeSut()
    jest.spyOn(addAccountStub, 'add'). mockImplementationOnce( async () => {
      return new Promise((resolve, reject) => reject(new Error())) 
    }) 
    const httResponse = await sut.handle(makeFakeRequest())    
    expect(httResponse.statusCode).toBe(500)
    expect(httResponse.body).toEqual(new ServerError(null) )
  }) 

  test('Should call EmailValidator with correct email', () => {
    const { sut, emailValidatorStub } = makeSut() 
    const isValidSpy = jest.spyOn(emailValidatorStub, "isValid")
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password' 
      }
     }
    sut.handle(httpRequest)    
    expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
  
  test('Should call AddAccount with correct values', () => {
    const { sut, addAccountStub } = makeSut() 
    const addSpy = jest.spyOn( addAccountStub, "add")
    sut.handle(makeFakeRequest())    
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })
  
  test('Should return 200 if valid data is provided', async () => {
    const { sut, emailValidatorStub } = makeSut() 
    const httResponse = await sut.handle(makeFakeRequest())    
    expect(httResponse.statusCode).toBe(200)
    expect(httResponse.body).toEqual(makeFakeAccount())
  })
  
  test('Should call Validation  with correct values', () => {
    const { sut, validationStub } = makeSut() 
    const validateSpy = jest.spyOn( validationStub, "validate")
    const httpRequest = makeFakeRequest()
    sut.handle(httpRequest)    
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })
  
  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut() 
    jest.spyOn( validationStub, "validate").mockReturnValueOnce(new MissingParamError('any_field'))
    const httpResponse = await sut.handle(makeFakeRequest()) 
    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })
})