import express from "express";
import cors from 'cors';
import helmet from 'helmet';
import { resolve } from 'path';


import routes from "./routes";


const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(resolve(__dirname, 'uploads', 'images')));
app.use(routes);


app.listen(3333);


