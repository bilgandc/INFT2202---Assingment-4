/*
* INFT2202 - Assignment 4
* Student ID: 100948423 & 100589655
* Name: Bilgan Kiris & Mariah Laroco
* Date: April 11th, 2025
* */

// purpose: handle CRUD operations for user profiles, including:
// GET, PUT, DELETE accounts

import express from 'express';
import Database from '../database.js';
import bcrypt from 'bcrypt';

const router = express.Router();
const dbInstance = Database.getInstance();

// Middleware to protect routes
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    return res.status(401).send("Unauthorized");
}

// GET - Get current user's profile
router.get('/profile', isAuthenticated, async (req, res) => {
    const db = await dbInstance.connect();
    const users = db.collection('users');

    const user = await users.findOne({ username: req.session.user.username }, { projection: { password: 0 } });
    if (!user) return res.status(404).send("User not found");
    res.json(user);
});

// PUT - Update current user's profile
router.put('/profile', isAuthenticated, async (req, res) => {
    const db = await dbInstance.connect();
    const users = db.collection('users');

    const { name, email, bio, password } = req.body;
    const updateFields = { name, email, bio };

    if (password) {
        updateFields.password = await bcrypt.hash(password, 10);
    }

    await users.updateOne(
        { username: req.session.user.username },
        { $set: updateFields }
    );

    res.send("Profile updated");
});

// DELETE - Delete current user's account
router.delete('/profile', isAuthenticated, async (req, res) => {
    const db = await dbInstance.connect();
    const users = db.collection('users');

    await users.deleteOne({ username: req.session.user.username });
    req.session.destroy();
    res.send("Account deleted");
});

export default router;
