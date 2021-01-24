import express from "express";
import cors from 'cors';
import helmet from 'helmet';
import { resolve } from 'path';



import routes from "./routes";


const app = express();

app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/images', express.static(resolve(__dirname, '..', 'uploads', 'images')));
app.use(routes);


app.listen(process.env.APP_PORT, () => {
 console.log('🗽 Server started an port 3333');
});


