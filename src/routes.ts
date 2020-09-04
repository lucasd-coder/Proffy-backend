import express from 'express';

import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';
import LoginController from './controllers/LoginController';
import ResetPassword from './controllers/ResetPassController';
import ForgotPassword from './controllers/ForgotPassController';
import FotoController from './controllers/FotoController';
import loginRequired from './middlewares/loginRequired';

const routes = express.Router();
const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const loginController = new LoginController();
const resetPassword = new ResetPassword();
const forgotPassword = new ForgotPassword();
const fotoController = new FotoController();


routes.post('/register', loginController.store);
routes.post('/auth', loginController.create);
routes.post('/auth/forgot_password', forgotPassword.store);
routes.post('/auth/reset_password', resetPassword.store);

routes.get('/classes/:id', classesController.show);
routes.put('/classes/:id', loginRequired, classesController.update);
routes.post('/classes', loginRequired, classesController.create);
routes.get('/classes', loginRequired, classesController.index);
routes.post('/', loginRequired, fotoController.store);


routes.post('/connections', loginRequired, connectionsController.create);
routes.get('/connections', loginRequired, connectionsController.index);



export default routes;