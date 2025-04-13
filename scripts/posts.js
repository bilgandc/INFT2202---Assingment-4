/*
* INFT2202 - Assignment 4
* Student ID: 100948423 & 100589655
* Name: Bilgan Kiris & Mariah Laroco
* Date: April 11th, 2025
* */

import express from 'express';
import Database from '../database.js';
import { ObjectId } from 'mongodb';

const router = express.Router();
const dbInstance = Database.getInstance();

// middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    return res.status(401).send("Unauthorized");
}

// GET all posts
router.get('/', async (req, res) => {
    const db = await dbInstance.connect();
    const posts = await db.collection('posts').find({}).toArray();
    res.json(posts);
});

// POST a new post
router.post('/', isAuthenticated, async (req, res) => {
    const db = await dbInstance.connect();
    const posts = db.collection('posts');

    const { title, content } = req.body;
    const post = {
        title,
        content,
        author: req.session.user.username,
        createdAt: new Date()
    };

    await posts.insertOne(post);
    res.status(201).send("Post created");
});

// PUT to update a post
router.put('/:id', isAuthenticated, async (req, res) => {
    const db = await dbInstance.connect();
    const posts = db.collection('posts');
    const { title, content } = req.body;

    const result = await posts.updateOne(
        { _id: new ObjectId(req.params.id), author: req.session.user.username },
        { $set: { title, content } }
    );

    if (result.matchedCount === 0) {
        return res.status(403).send("You can only edit your own posts.");
    }

    res.send("Post updated");
});

// DELETE a post
router.delete('/:id', isAuthenticated, async (req, res) => {
    const db = await dbInstance.connect();
    const posts = db.collection('posts');

    const result = await posts.deleteOne({
        _id: new ObjectId(req.params.id),
        author: req.session.user.username
    });

    if (result.deletedCount === 0) {
        return res.status(403).send("You can only delete your own posts.");
    }

    res.send("Post deleted");
});

export default router;
