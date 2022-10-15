import Layout from '../components/Layout'
import db from '../utils/db'
import TodoSchema from '../models/Todo'

interface Todo {
    todo: string
}

const Index = ({ todoList }: { todoList: Todo[]}) => {
    console.log('getStaticProps')
    console.log(todoList)

    return <Layout>this is index</Layout>
}

export const getStaticProps = async () => {
    await db.connect()

    const todoDocuments = await TodoSchema.find().lean()

    await db.disconnect()

    const todoList = todoDocuments ? todoDocuments.map((doc: Todo) => {
        return db.convertDocToObj(doc)
    }) : []

    return {
        props: {
            todoList
        }
    }
}

export default Index
