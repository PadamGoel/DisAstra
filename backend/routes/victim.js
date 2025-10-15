const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Victim } = require("../db");
const victimAuth = require("../middleware/victim");
const router = express.Router();

// Register victim
router.post("/register", async (req, res) => {
    const { username, phone, password } = req.body;
    
    try {
        const existingVictim = await Victim.findOne({ phone });
        if (existingVictim) {
            return res.status(400).json({ msg: "Phone number already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newVictim = new Victim({ 
            username, 
            phone, 
            password: hashedPassword 
        });
        
        await newVictim.save();
        res.json({ msg: "Victim registered successfully" });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(400).json({ msg: "Error registering victim", error: err.message });
    }
});

// Victim login
router.post("/login", async (req, res) => {
    const { phone, password } = req.body;
    
    try {
        const victim = await Victim.findOne({ phone });
        if (!victim) {
            return res.status(404).json({ msg: "Victim not found" });
        }

        const isMatch = await bcrypt.compare(password, victim.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: victim._id, role: "Victim" }, 
            process.env.JWT_SECRET, 
            { expiresIn: "7d" }
        );
        
        res.json({ 
            token,
            user: {
                id: victim._id,
                username: victim.username,
                phone: victim.phone
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Send SOS
router.post("/sos", victimAuth, async (req, res) => {
    const { location, battery, type, message } = req.body;
    
    try {
        const victim = await Victim.findById(req.user.id);
        if (!victim) {
            return res.status(404).json({ msg: "Victim not found" });
        }

        // Create SOS entry
        const newSOS = {
            location,
            battery,
            type: type.label || type,
            timestamp: new Date(),
            status: "Pending"
        };

        victim.sos.push(newSOS);
        await victim.save();

        const savedSOS = victim.sos[victim.sos.length - 1];

        res.json({ 
            msg: "SOS sent successfully", 
            sos: {
                ...savedSOS.toObject(),
                victimId: victim._id,
                victimName: victim.username,
                victimPhone: victim.phone
            }
        });
    } catch (err) {
        console.error("SOS error:", err);
        res.status(500).json({ msg: "Error sending SOS", error: err.message });
    }
});

// Get victim's SOS history
router.get("/sos-history", victimAuth, async (req, res) => {
    try {
        const victim = await Victim.findById(req.user.id);
        if (!victim) {
            return res.status(404).json({ msg: "Victim not found" });
        }
        
        res.json({ sos: victim.sos });
    } catch (err) {
        console.error("Error fetching SOS history:", err);
        res.status(500).json({ msg: "Error fetching SOS history" });
    }
});

// Get active SOS for victim
router.get("/active-sos", victimAuth, async (req, res) => {
    try {
        const victim = await Victim.findById(req.user.id);
        if (!victim) {
            return res.status(404).json({ msg: "Victim not found" });
        }
        
        // Get only pending or acknowledged SOS
        const activeSOS = victim.sos.filter(
            sos => sos.status === "Pending" || sos.status === "Acknowledged"
        );
        res.json({ activeSOS });
    } catch (err) {
        console.error("Error fetching active SOS:", err);
        res.status(500).json({ msg: "Error fetching active SOS" });
    }
});

// Get victim profile
router.get("/profile", victimAuth, async (req, res) => {
    try {
        const victim = await Victim.findById(req.user.id).select("-password");
        if (!victim) {
            return res.status(404).json({ msg: "Victim not found" });
        }
        
        res.json(victim);
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ msg: "Error fetching profile" });
    }
});

// Cancel/Resolve SOS
router.patch("/sos/:sosId/resolve", victimAuth, async (req, res) => {
    try {
        const victim = await Victim.findById(req.user.id);
        if (!victim) {
            return res.status(404).json({ msg: "Victim not found" });
        }

        const sos = victim.sos.id(req.params.sosId);
        if (!sos) {
            return res.status(404).json({ msg: "SOS not found" });
        }

        sos.status = "Resolved";
        await victim.save();

        res.json({ msg: "SOS resolved", sos });
    } catch (err) {
        console.error("Error resolving SOS:", err);
        res.status(500).json({ msg: "Error resolving SOS" });
    }
});

module.exports = router;