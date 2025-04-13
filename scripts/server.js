/*
* INFT2202 - Assignment 4
* Student ID: 100948423 & 100589655
* Name: Bilgan Kiris & Mariah Laroco
* Date: April 11th, 2025
* */

import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import Database from './database.js';
import bodyParser from 'body-parser';
import path from 'path';
import eventsRoutes from './routes/events.js';
import usersRoutes from './routes/users.js';
import postsRoutes from './routes/posts.js';



const app = express();
const dbInstance = Database.getInstance();

app.use(express.static('public')); // serving static HTML, CSS, JS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'volunteer-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // change to true with HTTPS
}));

// routes
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const db = await dbInstance.connect();
    const users = db.collection('users');

    const existing = await users.findOne({ username });
    if (existing) return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    await users.insertOne({ username, password: hashedPassword });

    res.status(200).send('Registered');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const db = await dbInstance.connect();
    const users = db.collection('users');

    const user = await users.findOne({ username });
    if (!user) return res.status(400).send('User not found');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).send('Invalid password');

    req.session.user = { username };
    res.status(200).send('Logged in');
});

// login middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// registering routes
app.use('/events', eventsRoutes);
app.use('/users', usersRoutes);
app.use('/posts', postsRoutes);



// error handling middleware
app.use((err, req, res, next) => {
    console.error("Something went wrong:", err.stack);
    res.status(500).send("Something went wrong!");
});

// serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/secure-content', (req, res) => {
    if (!req.session.user) return res.status(401).send('Unauthorized');
    res.status(200).json({ message: "Secret statistics content" });
});

// start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});