import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import qrcode from 'qrcode';
import path from 'path';
import updateNotifier from 'update-notifier';

import getLocalIpAddress from './extra/GetLocalIpAdress';
import fileRoutes from './routes/fileRoutes';
import packageJson from '../package.json';


export let currentPath = "./";

const currentVersion = packageJson.version;

export default function startServer(DevMode: boolean = false) {

  const notifier = updateNotifier({ pkg: packageJson });
  notifier.notify();


  const args = process.argv.slice(2);

  let port: string | undefined;
  let devMode = DevMode;
  let disableQRCode: boolean = false;

  args.forEach((arg, index) => {
    if (arg.toLowerCase() === '--port' || arg.toLowerCase() === '-p') {
      port = args[index + 1];
    }
    if (arg.toLowerCase() === '--dev') {
      devMode = true;
    }
    if (arg.toLowerCase() === '--disable-qrcode') {
      console.log("Disabling QR Code generation in terminal")
      disableQRCode = true
    }
    if (arg.toLowerCase() === "--version" || arg.toLowerCase() === "-v") {
      console.log(`   
        ShareoverLAN version : ${currentVersion}   
        `);
      process.exit(0);
    }
    if (arg.toLowerCase() === "--help" || arg.toLowerCase() === "-h") {
      console.log(`
        Usage: shareoverlan [options]

        Options:

        --port, -p <port>   Specify the port to run the server on (default: 6969)
        --version, -v       Show the current version of ShareoverLAN
        --disable-qrcode    Disable QR code generation in terminal (default: false)
        
        `)
      process.exit(0);
    };



  });


  const localIpAddress = getLocalIpAddress();
  const PORT: number | string = port ?? 6969;
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(cors());
  app.use('/download', express.static('.'));
  app.use(express.static(path.join(__dirname, "../", 'client')));

  const publicFolder = currentPath;
  app.use('/public', express.static(publicFolder, {
    dotfiles: 'allow',
  }));

  app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../", 'client', 'index.html'));
  });

  app.use('/api/v1/', fileRoutes);

  app.listen(PORT, () => {

    console.log("✅ shareoverlan CLI running!");
    console.log("Server is Listening at:");
    console.log(`--> Local:   http://localhost:${PORT}`);
    localIpAddress.forEach((el: string) => {
      console.log(`--> Network: http://${el}:${PORT}`);
      if (devMode || !disableQRCode) {
        qrcode.toString(`http://${el}:${PORT}`, { type: 'terminal' }, function (err: any, url: string) {
          console.log(url);
        });
      }
    });
  });
}

