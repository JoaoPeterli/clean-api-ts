import { Controller, HttpRequest, HttpResponse } from "../../presentation/protocols"
import { LogControllerDecorator } from "./log"

interface SutTyes {
  sut: LogControllerDecorator
  controllerStub: Controller 
}

const makeSut = (): SutTyes => {
    class ControllerStub implements Controller {
       async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
         const httpResponse: HttpResponse = {
          statusCode: 200,
          body: {
            name: 'joao'
          }
         }
         return new Promise(resolve => resolve(httpResponse)) 
       }
    }

    const controllerStub =  makeController()
    const sut = new LogControllerDecorator(controllerStub) 
    return {
      sut, 
      controllerStub
    }
}

const makeController = (): Controller => {
  class ControllerStub implements Controller {
       async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
         const httpResponse: HttpResponse = {
          statusCode: 200,
          body: {
            name: 'joao'
          }
         }
         return new Promise(resolve => resolve(httpResponse)) 
       }
    }
  return new ControllerStub()
}

describe('LogController Decorator', () => {
  test('Should call controller handle', async () => {
    // const controllerStub = new ControllerStub()
    const {sut, controllerStub } = makeSut() 
    const handleSpy = jest.spyOn(controllerStub, 'handle')
    const httpRequest = {
      body: {
        email: 'any_mail@mail.com',
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    await sut.handle(httpRequest)
    expect(handleSpy).toHaveBeenCalledWith(httpRequest)
  })
  
  test('Should return the same result of the controller', async () => {
    // const controllerStub = new ControllerStub()
    const {sut} = makeSut() 
    const httpRequest = {
      body: {
        email: 'any_mail@mail.com',
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual({
      statusCode: 200,
      body: {
        name: 'joao'
      }
    })
  })
})