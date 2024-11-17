import { User, IUser } from './db/models/user.model'
import { connectToDatabase } from './db/mongodb'
import bcrypt from 'bcryptjs'

export async function findUserByEmail(email: string) {
    try {
        await connectToDatabase()
        const user = await User.findOne({ email })
        return user
    } catch (error) {
        console.error('Error finding user:', error)
        throw error
    }
}

export async function createUser(data: {
    email: string,
    password: string,
    name?: string,
    //image?: string
}) {
    try {
        await connectToDatabase()
        const hashedPassword = await bcrypt.hash(data.password, 12)

        const user = await User.create({
            email: data.email,
            hashedPassword,
            name: data.name,
            //image: data.image
        })

        return user
    } catch (error) {
        console.error('Error creating user:', error)
        throw error
    }
}