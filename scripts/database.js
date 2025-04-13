/*
* INFT2202 - Assignment 4
* Student ID: 100948423 & 100589655
* Name: Bilgan Kiris & Mariah Laroco
* Date: April 11th, 2025
* */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const USER_NAME = process.env.MONGO_USER;
const PASSWORD = process.env.MONGO_PASSWORD;
const DB_NAME = process.env.MONGO_DB;
const CLUSTER = process.env.MONGO_CLUSTER;

const MONGO_URI = `mongodb+srv://${USER_NAME}:${PASSWORD}@${CLUSTER}/${DB_NAME}?retryWrites=true&w=majority&appName=inft2202a4`;

class Database {
    static instance;
    client;
    db = null;

    constructor() {
        this.client = new MongoClient(MONGO_URI);
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connect() {
        if (!this.db) {
            try {
                await this.client.connect();
                console.log(`Connected to MongoDB: ${DB_NAME}`);
                this.db = this.client.db(DB_NAME);
            } catch (error) {
                console.error("MongoDB connection failed:", error);
                throw error;
            }
        }
        return this.db;
    }

    async disconnect() {
        await this.client.close();
        console.log("🔌 Disconnected from MongoDB");
        this.db = null;
    }
}

export default Database;
