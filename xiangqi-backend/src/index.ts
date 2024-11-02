import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const server = express();
const port = process.env.PORT || 3001;

server.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'your-production-domain.com'
        : 'http://localhost:3000'
}));

server.use(express.json());

server.get('/hello', function (req, res) {
    res.json('Hello World!');
});

server.listen(port, function () {
    console.log('Listening on ' + port);
});
