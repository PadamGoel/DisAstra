const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Victim } = require("../db");
const victimMiddleware = require("../middleware/victim");
const { broadcastSOS } = require("../services/bridgefy");

const router = express.Router();

/**
 * ----------------------------------------
 *  VICTIM REGISTRATION
 * ----------------------------------------
 */
router.post("/register", async (req, res) => {
  const { username, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newVictim = new Victim({
      username,
      phone,
      password: hashedPassword,
    });

    await newVictim.save();

    return res.json({ msg: "Victim registered successfully" });
  } catch (error) {
    return res.status(400).json({
      msg: "Error registering victim",
      error: error.message,
    });
  }
});

/**
 * ----------------------------------------
 *  VICTIM LOGIN
 * ----------------------------------------
 */
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
      { username: victim.username, role: "Victim" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ msg: "Server error" });
  }
});

/**
 * ----------------------------------------
 *  AUTH CHECK ENDPOINT
 * ----------------------------------------
 */
router.get("/auth/check", victimMiddleware, (req, res) => {
  return res.status(200).json({
    username: req.username,
  });
});

/**
 * ----------------------------------------
 *  SEND SOS
 * ----------------------------------------
 */
router.post("/sos", victimMiddleware, async (req, res) => {
  const { lat, long, battery, type } = req.body;

  try {
    const victim = await Victim.findOne({ username: req.username });

    if (!victim) {
      return res.status(404).json({ msg: "Victim not found" });
    }

    // Create SOS entry
    const sosEntry = {
      location: { lat, long },
      battery,
      type,
      status: "Pending",
      timestamp: Date.now(),
    };

    victim.sos.push(sosEntry);
    await victim.save();

    // Prepare payload for Bridgefy SDK/cloud broadcast
    const payload = {
      id: `SOS-${Date.now()}`,
      username: victim.username,
      location: sosEntry.location,
      battery: sosEntry.battery,
      type: sosEntry.type,
      timestamp: sosEntry.timestamp,
    };

    const result = await broadcastSOS(payload);
    const lastIndex = victim.sos.length - 1;

    // Update SOS status based on broadcast result
    if (result.ok) {
      victim.sos[lastIndex].status =
        result.reason === "sdk-only" ? "Broadcasted (SDK)" : "Broadcasted";

      victim.sos[lastIndex].bridgefy =
        result.data || { note: result.reason };
    } else {
      victim.sos[lastIndex].status = "Failed";
      victim.sos[lastIndex].bridgefy = { error: result.reason };
    }

    await victim.save();

    return res.json({
      msg: "SOS processed",
      broadcast: result,
    });
  } catch (error) {
    console.error("Error in /sos route:", error);
    return res.status(500).json({ msg: "Error sending SOS" });
  }
});

module.exports = router;
