import express from 'express'
import mongoose from 'mongoose'
import CryptoJS from 'crypto-js';
import multer from 'multer'
import path from 'path';
import {GridFsStorage} from 'multer-gridfs-storage'
import dotenv from 'dotenv'
import type { GridFSBucket } from 'mongoose/node_modules/mongodb/mongodb'
import g from 'gridfs-stream'
import db from '../../db'

dotenv.config()

const router = express.Router()

let gridfsBucket: GridFSBucket
let gfs: g.Grid

const connection = mongoose.connection;
connection.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(connection.db, {
        bucketName: 'uploads-images'
    });

    gfs = g(connection.db, mongoose.mongo)
    gfs.collection('uploads-images');
});

if(!process.env.MONGODB_URI){
    throw new Error('url not found')
}

// Create storage engine
const storage = new GridFsStorage({
    url: process.env.MONGODB_URI,
    file: (
        req,
        file: {
            fieldname: string
            originalname: string
            encoding: string
            mimetype: string
        }
    ) => {
        return new Promise((resolve, reject) => {
            try {
                const basename = file.originalname.split('.')[0]

                // getでfilenameをparamsに渡すため
                // filenameに,/,+,= が入らないようにする
                if(typeof process.env.HASH_KEY === 'undefined') throw new Error('hash_key not found')
                const encryptedBasename =
                    CryptoJS.AES.encrypt(basename, process.env.HASH_KEY)
                    .toString()
                    .replace(/\+/g,'p1L2u3S')
                    .replace(/\//g,'s1L2a3S4h')
                    .replace(/=/g,'e1Q2u3A4l')
                
                const encryptedFilename =
                    encryptedBasename
                    + path.extname(file.originalname)
    
                const fileInfo = {
                    filename: encryptedFilename,
                    bucketName: 'uploads-images'
                }
    
                resolve(fileInfo)
            } catch (error) {
                reject(error)
            }
        });
    }
});

const checkFileType = (
    file: Express.Multer.File,
    cb:multer.FileFilterCallback
) => {
    // https://youtu.be/9Qzmri1WaaE?t=1515
    // define a regex that includes the file types we accept
    const filetypes = /jpeg|jpg|png|gif/;
    //check the file extention
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // more importantly, check the mimetype
    const mimetype = filetypes.test(file.mimetype);
    // if both are good then continue
    if (mimetype && extname) return cb(null, true);
    // otherwise, return error message
    cb(Error('missing filetype'))
}

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb)
    }
})

// get meta file
router.get('/', async (req,res) => {
    await db.connect()

    const files = await gfs.files.find().toArray()

    await db.disconnect()

    return res.status(200).json({ files })
})

router.get('/fetch/:filename', async (req,res) => {
    const { filename } = req.params
    if(!filename) return res.status(400).json({ msg: 'not found filename'})

    const file = await gfs.files.findOne({ filename })

    if(!file){
        return res.status(400).json({ msg: 'not exsit file'})
    }

    const readStream = gridfsBucket.openDownloadStream(file._id);
    readStream.pipe(res)
})

router.post('/upload', upload.array('upload-image-name', 4), async (req, res) => {
    console.log(req.files)
    // {
    //     fieldname: 'upload-image-name',
    //     originalname: 'otaku_girl.png',
    //     encoding: '7bit',
    //     mimetype: 'image/png',
    //     id: new ObjectId("634982275740b571b8d65a26"),
    //     filename: '433fa4f2b605f031e70f0748e5037ba9.png',
    //     metadata: null,
    //     bucketName: 'uploads-images',
    //     chunkSize: 261120,
    //     size: 317069,
    //     md5: undefined,
    //     uploadDate: 2022-10-14T15:37:13.204Z,
    //     contentType: 'image/png'
    // }[]
    return res.status(200).json({ msg: 'ok', files: req.files })
})

router.delete('/delete/:id', async (req,res) => {
    const { id } = req.params
    const _id = new mongoose.Types.ObjectId(id)

    gridfsBucket.delete(_id, (err: unknown) => {
        if(err) {
            return res.status(404).json({ msg: 'failed to delete image', err})
        }
    })

    return res.status(200).json({ msg: 'ok'})
})

export default router;