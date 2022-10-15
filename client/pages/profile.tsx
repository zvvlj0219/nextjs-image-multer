import { useEffect } from 'react'
import Layout from '../components/Layout'
import { baseUrl } from '../config'

const Profile = () => {
    console.log(baseUrl)
    useEffect(() => {
        const start = async () => {
            const res = await fetch(`${baseUrl}/profile`)
            const data = await res.json()
            console.log(data)
        }
        start()
    })
    return <Layout>this is profile</Layout>
}

export default Profile
