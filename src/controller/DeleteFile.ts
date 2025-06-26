
import path from "path";
import fs from "fs";


const DeleteFile = (req:any, res: any) => {

    let { name } = req.query;
    if (typeof name !== 'string') {
        return res.status(400).send('Invalid file name');
    }

    try {
        fs.unlink(path.join(__dirname, name), (err) => {
            if (err) {
                console.log("some Error occured")
                res.status(400).send("Error Occured")
            }
            res.status(200).send("File deleted successfully");
        })

    } catch (error) {
        console.log("error " + error)
        res.send('Something Went wrong')
    }

}

export default DeleteFile;




