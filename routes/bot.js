const express = require('express');
const router = express.Router();
const { WhatsappBot, PairCode } = require('../models');
const { whatsappClient } = require('../whatsapp/client');

router.post('/activate', async (req, res) => {
  try {
    const { sessionId, phoneNumber, pairCode } = req.body;
    
    // Verify pair code
    const code = await PairCode.findOne({ 
      where: { 
        code: pairCode,
        is_used: false,
        expires_at: { [Sequelize.Op.gt]: new Date() }
      }
    });

    if (!code) {
      return res.status(400).json({ success: false, error: 'Invalid or expired pair code' });
    }

    // Create bot record
    const bot = await WhatsappBot.create({
      user_id: code.user_id,
      phone_number: phoneNumber,
      session_id: sessionId,
      pair_code_id: code.id
    });

    // Mark code as used
    await code.update({ is_used: true });

    // Initialize WhatsApp client
    await whatsappClient.initialize(sessionId, phoneNumber);

    res.json({ 
      success: true, 
      message: 'Bot activation started. It may take up to 5 minutes.',
      botId: bot.id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const bot = await WhatsappBot.findOne({ where: { session_id: sessionId } });
    
    if (!bot) {
      return res.json({ success: false, error: 'Bot not found' });
    }
    
    res.json({ success: true, isActive: bot.is_active });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
