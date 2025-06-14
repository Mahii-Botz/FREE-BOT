const express = require('express');
const router = express.Router();
const { PairCode } = require('../models');

router.post('/generate', async (req, res) => {
  try {
    const { userId } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const pairCode = await PairCode.create({
      code,
      user_id: userId,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    res.json({ success: true, code: pairCode.code });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
