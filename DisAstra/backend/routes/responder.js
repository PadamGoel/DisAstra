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
        const hashedPassword = await bcrypt.hash(password, 10);

        const responder = new Responder({
            username,
            phone,
            password: hashedPassword,
            role
        });

        await responder.save();

        return res.json({ msg: "Responder registered successfully" });

    } catch (err) {
        return res.status(400).json({
            msg: "Error registering responder",
            error: err.message
        });
    }
});

// Login responder
router.post("/login", async (req, res) => {
    const { phone, password } = req.body;

    try {
        const responder = await Responder.findOne({ phone });
        if (!responder) {
            return res.status(404).json({ msg: "Responder not found" });
        }

        const isValid = await bcrypt.compare(password, responder.password);
        if (!isValid) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: responder._id, role: "Responder" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.json({ token });

    } catch (err) {
        return res.status(500).json({ msg: "Server error" });
    }
});

// Get all pending SOS
router.get("/sos", responderAuth, async (req, res) => {
    try {
        const pendingSOS = await Victim.find({ "sos.status": "Pending" });
        return res.json(pendingSOS);
    } catch (err) {
        return res.status(500).json({ msg: "Error fetching SOS" });
    }
});

// Assign responder to SOS
router.post("/assign/:victimId", responderAuth, async (req, res) => {
    try {
        const { victimId } = req.params;

        const responder = await Responder.findById(req.user.id);
        if (!responder) {
            return res.status(404).json({ msg: "Responder not found" });
        }

        responder.assignedSOS.push({ victimId });
        await responder.save();

        const victim = await Victim.findById(victimId);
        if (!victim) {
            return res.status(404).json({ msg: "Victim not found" });
        }

        const lastSOS = victim.sos[victim.sos.length - 1];
        lastSOS.status = "Acknowledged";
        await victim.save();

        return res.json({ msg: "Responder assigned to SOS" });

    } catch (err) {
        return res.status(500).json({ msg: "Error assigning responder" });
    }
});

module.exports = router;
