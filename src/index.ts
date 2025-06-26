import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import qrcode from 'qrcode';
import path from 'path';

dotenv.config();

import getLocalIpAddress from './extra/GetLocalIpAdress.js';
import fileRoutes from './routes/fileRoutes.js';

const args = process.argv.slice(2);
let port;
let devMode = false // Default is false;
args.forEach((arg, index) => {
    if (arg.toLowerCase() === '--port' || arg.toLowerCase() === '-p') {
        port = args[index + 1];
    }
    if (arg.toLowerCase() === '--dev') {
        devMode = true;
    }
});



const localIpAddress = getLocalIpAddress();
const PORT: number| string = port ?? 6969
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use('/download', express.static('./tmp/resource'))
app.use(express.static(path.join(__dirname, 'client')));
// Path to the folder you want to make public
const publicFolder = '.';

// Serve the folder publicly
app.use('/public', express.static(publicFolder));


// Sending the index.html file 
app.get('/', (req:Request, res:Response) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'))
})

app.use('/api/v1/', fileRoutes)

app.listen(PORT, () => {
  console.log("Server is Listening at ");
  console.log(`--> Local:   http://localhost:${PORT}`);
  localIpAddress.forEach((el:string) => {
    console.log(`--> Network: http://${el}:${PORT}`);
    if(!devMode){
      qrcode.toString(`http://${el}:${PORT}`,{type:'terminal'}, function (err:any, url:string) {
        console.log(url)
      })
    }
  })
});

