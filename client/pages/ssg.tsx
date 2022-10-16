import Layout from '../components/Layout'
import db from '../utils/db'
import TodoSchema from '../models/Todo'
import { ObjectId } from 'mongoose'
import { baseUrl } from '../config'


type BucketFile = {
    chunkSize: number
    contentType: string
    filename: string
    length: number
    uploadDate: string
    _id: ObjectId
}

const uri = baseUrl

type Props = {
    image: {
        id: string
        url: string
    }
}

const Ssg = ({ image }: Props) => {
    return (
        <Layout>
            <div>
                <img src={image.url} alt='' />
            </div>
        </Layout>
    )
}

// filenmae
// U2FsdGVkX1+6f7IQMvXf+c2wXvXlYK0GSRUou0XDmgA=.png

export const getStaticProps = async () => {
    await db.connect()

    const fetchImagesFileFromGridFs = async () => {
        const res = await fetch(`${uri}/images`)
        const { files } = await res.json() as { files: BucketFile[] }
        return files
    }

    const bucketFile = await fetchImagesFileFromGridFs()

    const fetchImageBinaryDataFromGridfs =
    async (filename: string) => {
        const res = await fetch(`${uri}/images/fetch/${filename}`)

        return  {
            id: 'sample_id',
            url: res.url
        }        
    }

    const samplefilename = 'U2FsdGVkX1+6f7IQMvXf+c2wXvXlYK0GSRUou0XDmgA=.png'

    const image = await fetchImageBinaryDataFromGridfs(samplefilename)

    await db.disconnect()

    return {
        props: {
            image
        }
    }
}

export default Ssg
