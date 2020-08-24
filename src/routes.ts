import express from 'express';

import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';
import LoginController from './controllers/LoginController';
import ResetPassword from './controllers/ResetPassController';
import ForgotPassword from './controllers/ForgotPassController';
import FotoController from './controllers/FotoController';

const routes = express.Router();
const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const loginController = new LoginController();
const resetPassword = new ResetPassword();
const forgotPassword = new ForgotPassword();
const fotoController = new FotoController();


routes.post('/', fotoController.store);
routes.post('/register', loginController.store);
routes.post('/auth', loginController.create);
routes.post('/auth/forgot_password', forgotPassword.store);
routes.post('/auth/reset_password', resetPassword.store);

routes.post('/classes', classesController.create);
routes.get('/classes', classesController.index);

routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);



export default routes;