// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import pinataSDK from '@pinata/sdk';
import { NextRequest, NextResponse } from 'next/server';
import fs, { existsSync } from 'fs'
import fsPromises from "fs/promises";
import path from "path"

const pinata = new pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET_KEY);

export async function POST(req: NextRequest, res: NextResponse) 
{
    const data = await req.formData();
    const file = data.get('file') as File
    const fileArrayBuffer = await file.arrayBuffer();
    const destinationDirPath = path.join(process.cwd(), "public/upload");
    
    if (!existsSync(destinationDirPath)) {
        fs.mkdir(destinationDirPath, { recursive: true });
    }

    const finalPath = path.join(destinationDirPath, file.name)
    await fsPromises.writeFile(
        finalPath,
        Buffer.from(fileArrayBuffer)
    );

    const readableStreamForFile = fs.createReadStream(finalPath);
    const options = {
        pinataMetadata: {
            name: 'test-cf-file',
        },
        pinataOptions: {
            cidVersion: 0
        }
    };
    const resp = await pinata.pinFileToIPFS(readableStreamForFile, options)
    return NextResponse.json({ IpfsHash: resp.IpfsHash });
}
