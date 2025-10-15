const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Responder, Victim } = require("../db");
const responderAuth = require("../middleware/responder");
const router = express.Router();

// Register responder
router.post("/register", async (req, res) => {
    const { username, phone, password, role } = req.body;
    try {
        const existingResponder = await Responder.findOne({ phone });
        if (existingResponder) {
            return res.status(400).json({ msg: "Phone number already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newResponder = new Responder({ 
            username, 
            phone, 
            password: hashedPassword, 
            role: role || "Volunteer" 
        });
        await newResponder.save();
        res.json({ msg: "Responder registered successfully" });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(400).json({ msg: "Error registering responder", error: err.message });
    }
});

// Responder login
router.post("/login", async (req, res) => {
    const { phone, password } = req.body;
    try {
        const responder = await Responder.findOne({ phone });
        if (!responder) {
            return res.status(404).json({ msg: "Responder not found" });
        }

        const isMatch = await bcrypt.compare(password, responder.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: responder._id, role: "Responder" }, 
            process.env.JWT_SECRET, 
            { expiresIn: "7d" }
        );
        
        res.json({ 
            token,
            user: {
                id: responder._id,
                username: responder.username,
                phone: responder.phone,
                role: responder.role
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Get all pending SOS (with victim details)
router.get("/sos", responderAuth, async (req, res) => {
    try {
        // Find all victims with pending SOS
        const victims = await Victim.find({ 
            "sos.status": "Pending" 
        }).select("-password");

        // Format the response with detailed SOS information
        const sosAlerts = [];
        victims.forEach(victim => {
            victim.sos.forEach(sos => {
                if (sos.status === "Pending") {
                    sosAlerts.push({
                        sosId: sos._id,
                        victimId: victim._id,
                        victimName: victim.username,
                        victimPhone: victim.phone,
                        location: sos.location,
                        battery: sos.battery,
                        type: sos.type,
                        timestamp: sos.timestamp,
                        status: sos.status
                    });
                }
            });
        });

        // Sort by most recent first
        sosAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({ sosAlerts });
    } catch (err) {
        console.error("Error fetching SOS:", err);
        res.status(500).json({ msg: "Error fetching SOS" });
    }
});

// Get new SOS alerts (for polling - only SOS after a certain timestamp)
router.get("/sos/new", responderAuth, async (req, res) => {
    try {
        const { since } = req.query; // timestamp of last fetch
        const sinceDate = since ? new Date(since) : new Date(Date.now() - 5 * 60 * 1000); // Default: last 5 minutes

        const victims = await Victim.find({
            "sos.timestamp": { $gte: sinceDate },
            "sos.status": "Pending"
        }).select("-password");

        const newSosAlerts = [];
        victims.forEach(victim => {
            victim.sos.forEach(sos => {
                if (sos.status === "Pending" && new Date(sos.timestamp) >= sinceDate) {
                    newSosAlerts.push({
                        sosId: sos._id,
                        victimId: victim._id,
                        victimName: victim.username,
                        victimPhone: victim.phone,
                        location: sos.location,
                        battery: sos.battery,
                        type: sos.type,
                        timestamp: sos.timestamp,
                        status: sos.status
                    });
                }
            });
        });

        newSosAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({ 
            newSosAlerts,
            count: newSosAlerts.length,
            timestamp: new Date()
        });
    } catch (err) {
        console.error("Error fetching new SOS:", err);
        res.status(500).json({ msg: "Error fetching new SOS" });
    }
});

// Assign responder to SOS (Acknowledge)
router.post("/sos/:sosId/acknowledge", responderAuth, async (req, res) => {
    try {
        const { sosId } = req.params;
        const { victimId } = req.body;

        // Update responder's assigned SOS
        const responder = await Responder.findById(req.user.id);
        responder.assignedSOS.push({ 
            victimId, 
            status: "In-Progress" 
        });
        await responder.save();

        // Update victim's SOS status
        const victim = await Victim.findById(victimId);
        if (!victim) {
            return res.status(404).json({ msg: "Victim not found" });
        }

        const sos = victim.sos.id(sosId);
        if (!sos) {
            return res.status(404).json({ msg: "SOS not found" });
        }

        sos.status = "Acknowledged";
        await victim.save();

        res.json({ 
            msg: "SOS acknowledged successfully",
            responderName: responder.username,
            sos 
        });
    } catch (err) {
        console.error("Error acknowledging SOS:", err);
        res.status(500).json({ msg: "Error acknowledging SOS" });
    }
});

// Update SOS status
router.patch("/sos/:sosId/status", responderAuth, async (req, res) => {
    try {
        const { sosId } = req.params;
        const { victimId, status } = req.body; // status: "In-Progress" | "Resolved"

        const victim = await Victim.findById(victimId);
        if (!victim) {
            return res.status(404).json({ msg: "Victim not found" });
        }

        const sos = victim.sos.id(sosId);
        if (!sos) {
            return res.status(404).json({ msg: "SOS not found" });
        }

        sos.status = status;
        await victim.save();

        res.json({ msg: `SOS status updated to ${status}`, sos });
    } catch (err) {
        console.error("Error updating SOS status:", err);
        res.status(500).json({ msg: "Error updating SOS status" });
    }
});

// Get responder's assigned SOS
router.get("/my-assignments", responderAuth, async (req, res) => {
    try {
        const responder = await Responder.findById(req.user.id).populate({
            path: "assignedSOS.victimId",
            select: "-password"
        });

        const assignments = responder.assignedSOS.map(assignment => ({
            victimId: assignment.victimId._id,
            victimName: assignment.victimId.username,
            victimPhone: assignment.victimId.phone,
            status: assignment.status,
            sos: assignment.victimId.sos
        }));

        res.json({ assignments });
    } catch (err) {
        console.error("Error fetching assignments:", err);
        res.status(500).json({ msg: "Error fetching assignments" });
    }
});

// Get responder profile
router.get("/profile", responderAuth, async (req, res) => {
    try {
        const responder = await Responder.findById(req.user.id).select("-password");
        if (!responder) {
            return res.status(404).json({ msg: "Responder not found" });
        }
        
        res.json(responder);
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ msg: "Error fetching profile" });
    }
});

module.exports = router;