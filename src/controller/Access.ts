
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();


const Access = (req: Request,res: Response) => {

    const accesskey = process.env.ACCESSKEY ?? "sumit"

    let {accessToken} = req.query;
    
    if(accessToken == accesskey){
        res.status(200).send("Authorized")
    }
    else{
        res.status(400).send("Not Authorized")
    }
}

export default Access;