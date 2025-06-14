const { useMultiFileAuthState, makeWASocket, fetchLatestBaileysVersion, Browsers } = require('@whiskeysockets/baileys');
const P = require('pino');
const path = require('path');
const fs = require('fs');
const File = require('megajs').File;
const { WhatsappBot } = require('../models');

class WhatsAppClient {
    constructor() {
        this.clients = new Map();
    }

    async initialize(sessionId, phoneNumber) {
        if (this.clients.has(sessionId)) {
            return this.clients.get(sessionId);
        }

        const authDir = path.join(__dirname, '..', 'auth_info_baileys', sessionId);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(authDir)) {
            fs.mkdirSync(authDir, { recursive: true });
        }

        // Check if session exists locally
        if (!fs.existsSync(path.join(authDir, 'creds.json'))) {
            if (!process.env.SESSION_ID) {
                throw new Error("Please add your session to SESSION_ID env !!");
            }
            
            try {
                const sessdata = process.env.SESSION_ID;
                const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
                await new Promise((resolve, reject) => {
                    filer.download((err, data) => {
                        if (err) return reject(err);
                        fs.writeFile(path.join(authDir, 'creds.json'), data, (err) => {
                            if (err) return reject(err);
                            console.log("Session downloaded ✅");
                            resolve();
                        });
                    });
                });
            } catch (error) {
                console.error("Error downloading session:", error);
                throw error;
            }
        }

        try {
            console.log(`Initializing WhatsApp for ${phoneNumber}`);
            const { state, saveCreds } = await useMultiFileAuthState(authDir);
            const { version } = await fetchLatestBaileysVersion();

            const sock = makeWASocket({
                logger: P({ level: 'silent' }),
                printQRInTerminal: false,
                browser: Browsers.macOS("Firefox"),
                syncFullHistory: true,
                auth: state,
                version,
            });

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect.error?.output?.statusCode !== 401);
                    console.log(`Connection closed for ${phoneNumber}, reconnecting: ${shouldReconnect}`);
                    
                    // Update bot status in database
                    await WhatsappBot.update(
                        { is_active: false },
                        { where: { session_id: sessionId } }
                    );

                    if (shouldReconnect) {
                        setTimeout(() => this.initialize(sessionId, phoneNumber), 5000);
                    }
                } else if (connection === 'open') {
                    console.log(`Connected to WhatsApp as ${phoneNumber}`);
                    
                    // Update bot status in database
                    await WhatsappBot.update(
                        { is_active: true, last_seen: new Date() },
                        { where: { session_id: sessionId } }
                    );
                }
            });

            // Setup status watcher
            this.setupStatusWatcher(sock, phoneNumber, sessionId);

            this.clients.set(sessionId, sock);
            return sock;
        } catch (error) {
            console.error(`Error initializing WhatsApp for ${phoneNumber}:`, error);
            throw error;
        }
    }

    setupStatusWatcher(sock, phoneNumber, sessionId) {
        setInterval(async () => {
            try {
                const statusUpdates = await sock.fetchStatusUpdates();
                if (statusUpdates && statusUpdates.length > 0) {
                    for (const status of statusUpdates) {
                        await sock.sendReadReceipt(status.jid, status.id);
                        console.log(`Marked status as seen for ${status.jid}`);
                        
                        // Update last seen in database
                        await WhatsappBot.update(
                            { last_seen: new Date() },
                            { where: { session_id: sessionId } }
                        );
                    }
                }
            } catch (error) {
                console.error('Error checking status updates:', error);
            }
        }, 30000); // Check every 30 seconds
    }
}

module.exports = { whatsappClient: new WhatsAppClient() };
