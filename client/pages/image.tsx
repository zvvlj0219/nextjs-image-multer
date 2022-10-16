import { ObjectId } from 'mongoose'
import { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { baseUrl } from '../config'
import styles from '../styles/image.module.css'
import db from '../utils/db'

interface FetchOption {
    method: string
    headers?: {
        [key: string ]: string
    },
    body: FormData
}

type BucketFile = {
    chunkSize: number
    contentType: string
    filename: string
    length: number
    uploadDate: string
    _id: ObjectId
}

type UploadFile = {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    id: ObjectId
    filename: string
    metadata: any
    bucketName: string
    chunkSize: number
    size: number
    md5: any
    uploadDate: Date
    contentType: string
}

const isBucketFile =  (file: BucketFile | UploadFile): file is BucketFile =>{
    if('length' in file) {
        return true
    } else {
        return false
    }
}

interface Image {
    id: string
    file: File
}

interface Preview {
    id: string
    url: FileReader['result'] | undefined
}

interface Post {
    id: ObjectId
    url: string
}

const uri = baseUrl

type Props = {
    _posts: Post[]
}

const Image = ({ _posts }: Props) => {
    const fileInputElement = useRef<HTMLInputElement>(null)
    const [posts, setPosts] = useState<Post[]>(_posts)
    const [selectedfiles, setSelectedFiles] = useState<Image[] | null>(null)
    const [previewSrc, setPreviewSrc] = useState<Preview[]>([])
    const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false)

    const selectImageHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        setIsPreviewActive(true)

        if (fileInputElement.current === null) return 
        const FileObject = fileInputElement.current.files as FileList

        const FileArray = Object.keys(FileObject).map((key: string) => {
            const file = FileObject[Number(key)]

            return {
                id: file.name,
                file
            } as Image
        })

        setSelectedFiles(FileArray)

        // call preview
        for (let i = 0; i < FileObject.length; i+= 1) {
            previewSelectedImage(FileArray[i])
        }
    }

    const previewSelectedImage = (img: Image) => {
        if (!img && !isPreviewActive) return

        const reader = new FileReader()
    
        reader.readAsDataURL(img.file)
    
        reader.onload = event => {
            
            setPreviewSrc(previewSrc => {
                return [
                    ...previewSrc,
                    {
                        id: event.target?.result as string,
                        url: event.target?.result
                    }
                ]
            })
        }
    }
    
    const removePreviewImage = (id: string) => {
        const updatedPreviewSrc = previewSrc.filter(preview => {
            return preview.id !== id
        })

        if (updatedPreviewSrc.length === 0) {
            setIsPreviewActive(false)
        }

        setPreviewSrc(updatedPreviewSrc)
    }

    const uploadImageToGridFs = async () => {
        if(!selectedfiles) return

        try {
            const formData = new FormData()
            selectedfiles.forEach((img: Image) => {
                formData.append('upload-image-name', img.file)
            })
    
            const options: FetchOption = {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData
            }
    
            // fetchでバイナリデータを送信する際
            // boundaryを正常に設定させるために
            // Content-Typeを削除する
            if(typeof options.headers === 'undefined') return
            delete options.headers['Content-Type']
    
            const res = await fetch(`${uri}/images/upload`, options)
            const { files } = await res.json() as { files: UploadFile[] }

            if(files) {
                setIsPreviewActive(false)
                // refetch
                files.forEach((file: UploadFile) => {
                    fetchImageBinaryDataFromGridfs(file)
                })
            }
        } catch (error) {
            throw new Error('something wrong')
        }
    }

    const deleteImageFromGridFs = async (id: ObjectId) => {
        const res = await fetch(`${uri}/images/delete/${id}`,{
            method: 'DELETE'
        })

        if(res) {
            const updatedPosts = posts.filter(post => {
                return post.id !== id
            })
            setPosts(updatedPosts)
        }
    }

    const fetchImageBinaryDataFromGridfs = async (file: BucketFile | UploadFile): Promise<void> => {
        const res = await fetch(`${uri}/images/fetch/${file.filename}`)

        if (isBucketFile(file)) {
            setPosts(prevPosts => {
                 return [
                    ...prevPosts,
                    {
                        id: file._id,
                        url: res.url
                    }
                ]
            })
        } else {
            setPosts(prevPosts => {
                return [
                   ...prevPosts,
                   {
                       id: file.id,
                       url: res.url
                   }
               ]
           })
        }
        
    }
    
    return (
        <Layout>
            <h2 className={styles.heading}>-Upload Image to mongodb Gridfs-</h2>
            <div className='upload_image_form_container'>
                <div className={`${styles.flex_container_column}`}>
                    <form
                        className='select_image'
                        encType='multipart/form-data'
                    >
                        {
                            !isPreviewActive 
                            && (
                                <label
                                    htmlFor='upload-image-id'
                                    className={styles.select_image_label}
                                >
                                    select images
                                    <input
                                        type='file'
                                        accept='image/*'
                                        name='upload-image-name'
                                        id='upload-image-id'
                                        multiple
                                        className={styles.display_none}
                                        ref={fileInputElement}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => selectImageHandler(event)}
                                    />
                                </label>
                            )
                        }  
                        {
                            previewSrc.length !== 0
                            && isPreviewActive
                            && (
                                <div className='preview_image_container'>
                                    <p>preview</p>
                                    {
                                        previewSrc.map(preview => (
                                            typeof preview.url !== 'undefined' ? (
                                                <div key={preview.id} className='preview_image_lists'>
                                                    <div className={styles.image_wrapper}>
                                                        <img src={String(preview.url)} alt='' className={styles.image} />
                                                        <div className={styles.preview_button_container}>
                                                            <button
                                                                type='button'
                                                                onClick={() => removePreviewImage(preview.id)}
                                                                className={styles.cancel_button}
                                                            >
                                                                cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div 
                                                    className={styles.image_wrapper}
                                                    key={String(preview.id)}
                                                >
                                                    <p>faild to preview image</p>
                                                </div>
                                            )
                                        ))
                                    }
                                    <div className={`${styles.flex_container_row}  ${styles.justify_content_flexEnd}`}>
                                        <div className={styles.preview_button_container}>
                                            <button
                                                type='button'
                                                onClick={() => setIsPreviewActive(false)}
                                                className={styles.cancel_all_button}
                                            >
                                                cancel
                                            </button>
                                        </div>
                                        <div className={styles.preview_button_container}>
                                            <button
                                                type='button'
                                                onClick={() => uploadImageToGridFs()}
                                                className={styles.upload_button}
                                            >
                                                upload
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </form>
                </div>
            </div>
            <div className='user_posts'>
                <div className={styles.flex_container_column}>
                    <p>posts</p>
                    {
                        posts.length !== 0 && posts.map(post => (
                            <div className={styles.image_wrapper} key={String(post.id)}>
                                <img src={post.url} alt='' className={styles.image} />
                                <button
                                    type='button'
                                    onClick={() => deleteImageFromGridFs(post.id)}
                                    className={styles.delete_button}
                                >
                                    delete
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>
        </Layout>
    );
}

export const getStaticProps = async () => {
    await db.connect()

    const fetchImagesFileFromGridFs = async () => {
        const res = await fetch(`${uri}/images`)
        const { files } = await res.json() as { files: BucketFile[] }
        return files
    }

    const bucketFile = await fetchImagesFileFromGridFs()

    const fetchImageBinaryDataFromGridfs = async (file: BucketFile) => {
        const res = await fetch(`${uri}/images/fetch/${file.filename}`)

        return {
            id: file._id,
            url: res.url
        }
    }

    const mapResult = bucketFile.map(async (file: BucketFile) => {
        return fetchImageBinaryDataFromGridfs(file)
    })

    const getPosts = async () => {
        const posts = await Promise.all(mapResult)
        return posts as Post[]
    }

    const _posts = await getPosts()
    
    await db.disconnect()

    return {
        props: {
            bucketFile,
            _posts
        }
    }
}


export default Image