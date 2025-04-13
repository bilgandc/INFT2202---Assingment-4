/*
* INFT2202 - Assignment 4
* Student ID: 100948423 & 100589655
* Name: Bilgan Kiris & Mariah Laroco
* Date: April 11th, 2025
* */

import express from 'express';
import Database from '../database.js';
import {ObjectId} from "mongodb";

const router = express.Router();
const dbInstance = Database.getInstance();

// GET all events
router.get('/', async (req, res) => {
    const db = await dbInstance.connect();
    const events = await db.collection('events').find({}).toArray();
    res.json(events);
});

// POST a new event
router.post('/', async (req, res) => {
    const { title, date, category, description } = req.body;
    const db = await dbInstance.connect();
    await db.collection('events').insertOne({ title, date, category, description });
    res.status(201).send('Event added');
});

// PUT
router.put('/:id', async (req, res) => {
    const db = await dbInstance.connect();
    const { title, date, category, description } = req.body;
    const { id } = req.params;

    await db.collection('events').updateOne(
        { _id: new ObjectId(id) },
        { $set: { title, date, category, description } }
    );
    res.send('Event updated');
});

// DELETE an event
router.delete('/:id', async (req, res) => {
    const db = await dbInstance.connect();
    const { id } = req.params;

    await db.collection('events').deleteOne({ _id: new ObjectId(id) });
    res.send('Event deleted');
});

export default router;
