import nodemailer from 'nodemailer';
import * as mail from '../config/mail';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

const transport = nodemailer.createTransport({
    host: mail.host,
    port: mail.port,
    auth: {
        user: mail.user,
        pass: mail.pass
    }
});

transport.use('compile', hbs({
    viewEngine: {
        defaultLayout: undefined,
        partialsDir: path.resolve('./src/resources/mail/')
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',

}));

export default transport;