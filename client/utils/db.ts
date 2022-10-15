import mongoose from 'mongoose'

// ConnectionStates {
//     disconnected: 0,
//     connected: 1,
//     connecting: 2,
//     disconnecting: 3,
//     uninitialized: 99,
// }

interface Connection {
    isConnected: number
}

class DB {
    private connection: Connection

    constructor() {
        this.connection = {
            isConnected: 0
        }
    }

    readyStateLogger() {
        console.log(`current readyState = ${this.connection.isConnected}`)
    }

    async connect() {
        if (!process.env.MONGODB_URI) return console.log('url is wrong')

        if (this.connection.isConnected) {
            console.log('mongodb was already connected')
            return
        }

        if (mongoose.connections.length > 0) {
            this.connection.isConnected = mongoose.connections[0].readyState

            if (this.connection.isConnected === 1) {
                console.log('use previous connection')
                return
            }

            await mongoose.disconnect()
            console.log('mongoose disconnected')
            this.readyStateLogger()
        }

        const db = await mongoose.connect(process.env.MONGODB_URI)
        this.connection.isConnected = db.connections[0].readyState
        this.readyStateLogger()
    }

    async disconnect() {
        if (
            this.connection.isConnected &&
            process.env.NODE_ENV === 'production'
        ) {
            await mongoose.disconnect()
            this.connection.isConnected = 0
            console.log('mongoose disconnected')
        } else {
            console.log('not disconnected (env = development)')
            this.readyStateLogger()
        }
    }

    convertDocToObj(doc: any) {
        doc._id = doc._id.toString()
        doc.createdAt = doc.createdAt.toString()
        doc.updatedAt = doc.updatedAt.toString()
        return doc
    }
}

export default new DB()