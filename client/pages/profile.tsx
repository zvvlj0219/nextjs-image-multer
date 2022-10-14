import { useEffect } from 'react'
import Layout from '../components/Layout'
import { baseUrl } from '../config'

const Profile = () => {
    useEffect(() => {
        const start = async () => {
            const res = await fetch(`${baseUrl}/profile`)
            const data = await res.json()
            console.log(data)
        }
        start()
    })
    return <Layout>this is index</Layout>
}

export default Profile
