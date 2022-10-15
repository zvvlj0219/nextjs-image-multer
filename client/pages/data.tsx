import { useEffect } from 'react'
import Layout from '../components/Layout'
import { baseUrl } from '../config'

const Data = () => {
    console.log(baseUrl)
    useEffect(() => {
        const start = async () => {
            const res = await fetch(`${baseUrl}/data`)
            const data = await res.json()
            console.log('useEffect')
            console.log(data)
        }
        start()
    })
    return <Layout>this is data</Layout>
}

export default Data
