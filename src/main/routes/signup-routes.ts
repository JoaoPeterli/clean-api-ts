import { Router } from "express";
import { makeSignUpController } from '../factories/signup'
import { adapterRouter } from '../adapters/express-route-adapter'

export default (router: Router): void => {
  router.post('/signup', adapterRouter(makeSignUpController()))
}