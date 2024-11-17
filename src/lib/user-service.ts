import { ObjectId } from "mongodb"
import clientPromise from "./db/mongodb"
import bcrypt from "bcryptjs"

export interface User {
    _id: ObjectId
    email: string
    hashedPassword: string
    name?: string
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const client = await clientPromise
    const collection = client.db().collection("users")
    return collection.findOne({ email }) as Promise<User | null>
}

export async function createUser(
    email: string, 
    password: string, 
    name?: string
): Promise<User> {
    const client = await clientPromise
    const collection = client.db().collection("users")
    
    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
        throw new Error("User already exists")
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const result = await collection.insertOne({
        email,
        hashedPassword,
        name,
        createdAt: new Date()
    })

    return {
        _id: result.insertedId,
        email,
        hashedPassword,
        name
    }
}