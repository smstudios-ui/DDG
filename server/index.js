const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const dns = require('dns');

// Force the app to use Google/Cloudflare DNS to bypass ISP blocking
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
};

mongoose.connect(MONGODB_URI, options)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
    });

// Schemas
const projectSchema = new mongoose.Schema({
    title: String,
    category: String,
    image: String,
    description: String,
    mediaType: String,
    youtubeId: String,
    pageContent: String,
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    status: { type: String, default: 'unread' },
    createdAt: { type: Date, default: Date.now }
});

const partnerSchema = new mongoose.Schema({
    name: String,
    char: String,
    image: String,
    url: String,
    createdAt: { type: Date, default: Date.now }
});

const heroBannerSchema = new mongoose.Schema({
    title: String,
    tag: String,
    url: String,
    createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);
const Partner = mongoose.model('Partner', partnerSchema);
const HeroBanner = mongoose.model('HeroBanner', heroBannerSchema);
const Message = mongoose.model('Message', messageSchema);

// API Routes

// Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Single Project
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        res.json(project);
    } catch (err) {
        res.status(404).json({ error: 'Project not found' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        await newProject.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update a project
app.put('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Track a view
app.post('/api/projects/:id/view', async (req, res) => {
    try {
        await Project.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Partners
app.get('/api/partners', async (req, res) => {
    try {
        const partners = await Partner.find().sort({ createdAt: -1 });
        res.json(partners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/partners', async (req, res) => {
    try {
        const newPartner = new Partner(req.body);
        await newPartner.save();
        res.status(201).json(newPartner);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/partners/:id', async (req, res) => {
    try {
        await Partner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Partner deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Hero Banners
app.get('/api/hero-banners', async (req, res) => {
    try {
        const banners = await HeroBanner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/hero-banners', async (req, res) => {
    try {
        const newBanner = new HeroBanner(req.body);
        await newBanner.save();
        res.status(201).json(newBanner);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/hero-banners/:id', async (req, res) => {
    try {
        await HeroBanner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// MESSAGES ROUTES
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/messages', async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save();
        res.status(201).json(message);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
