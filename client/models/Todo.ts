import mongoose, { models } from 'mongoose'

interface TodoDoc extends mongoose.Document {
    todo: string
}

interface TodoModel extends mongoose.Model<TodoDoc> {}

const todoSchema = new mongoose.Schema(
    {
        todo: {
            type: String,
            require: true
        }
    },
    {
        timestamps: true
    }
)

const schema = models.Todo
    ? (models.Todo as TodoModel)
    : mongoose.model<TodoDoc, TodoModel>('Todo', todoSchema)

export default schema
