const staticConfig = {
    // ==================== BAILEYS & SESSION ====================
    BAILEYS: "@whiskeysockets/baileys",
    SESSION_ID: process.env.SESSION_ID || "",
    CDN: process.env.CDN || "https://bandaheali-cdn.koyeb.app",
};

const fs = require('fs');

// 🔁 CHANGED: GitHub DB → Supabase DB
const db = require('./lib/db');

if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

// ================= LOAD STATE =================
let getGithub = {};          // (naam same rakha for compatibility)
let configLoaded = false;
let userFolder = 'global';  // Default folder

// ================= LOAD CONFIG =================
async function loadConfig(botNumber = null) {
    try {
        console.log('Loading Configuration From  Database By SMD 💾');

        // Set user folder
        if (botNumber && botNumber !== 'unknown' && botNumber !== 'ActiveBot') {
            userFolder = `users/${botNumber}`;
        } else {
            userFolder = 'global';
        }

        // 🔁 CHANGED: Load from Supabase
        await db.searchAndDownloadFile(
            'configDb.json',
            JSON.stringify(getDefaultConfig(), null, 2),
            'configDb.json',
            userFolder
        );

        if (fs.existsSync('./configDb.json')) {
            const configData = fs.readFileSync('./configDb.json', 'utf8');
            getGithub = JSON.parse(configData);
            configLoaded = true;
        }

    } catch (error) {
        // fallback local
        fs.writeFileSync(
            './configDb.json',
            JSON.stringify(getDefaultConfig(), null, 2)
        );
    }
}

// ================= USER FOLDER =================
function setUserFolder(botNumber) {
    if (botNumber && botNumber !== 'unknown' && botNumber !== 'ActiveBot') {
        userFolder = `users/${botNumber}`;
    } else {
        userFolder = 'global';
    }
}

// ================= DEFAULT CONFIG =================
function getDefaultConfig() {
    return {
        // ==================== MEDIA SETTINGS ====================
        START_IMG: "https://ik.imagekit.io/shaban/SHABAN-1762176451326_q4lXc_XvH.jpg",
        MENU_IMAGE_URL: "https://ik.imagekit.io/shaban/SHABAN-1762176451326_q4lXc_XvH.jpg",
        ALIVE_IMG: "https://ik.imagekit.io/shaban/SHABAN-1762176451326_q4lXc_XvH.jpg",

        // ==================== STATUS SETTINGS ====================
        AUTO_STATUS_SEEN: "true",
        AUTO_STATUS_REPLY: "false",
        AUTO_STATUS_REACT: "true",
        AUTO_STATUS_REACT_EMOJIS: "💝,💖,💗,❤️,🧡,💛,💚,💙",
        AUTO_STATUS_MSG: "*SEEN YOUR STATUS SHABAN-MD*",

        // ==================== BOT SETTINGS ====================
        PREFIX: ".",
        BOT_NAME: "SHABAN-MD",
        DESCRIPTION: "*© POWERED BY MR SHABAN*",
        STICKER_NAME: "SHABAN-MD",
        LIVE_MSG: "> Zinda Hun Yar *SMD*⚡",

        // ==================== OWNER SETTINGS ====================
        OWNER_NUMBER: "923043788282",
        OWNER_NAME: "MR SHABAN",
        DEV: "923043788282",

        // ==================== REACTION SETTINGS ====================
        AUTO_REACT: "false",
        CUSTOM_REACT: "false",
        CUSTOM_REACT_EMOJIS: "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",

        // ==================== MESSAGE SETTINGS ====================
        READ_MESSAGE: "false",
        MENTION_REPLY: "false",
        AUTO_REPLY: "false",
        AUTO_TYPING: "false",
        READ_CMD: "false",

        // ==================== GROUP SETTINGS ====================
        WELCOME: "false",
        ADMIN_EVENTS: "false",
        ANTI_DELETE: "false",
        ANTI_EDIT: "false",
        ANTI_EDIT_PATH: "inbox",
        ANTI_DEL_PATH: "inbox",

        // ==================== SECURITY SETTINGS ====================
        ANTI_LINK: "false",
        ANTI_LINK_ACTION: "warn",
        ANTI_MEDIA: "false",
        ANTI_BAD: "false",
        ANTI_VV: "false",
        ANTI_CALL: "false",
        REJECT_MSG: "*_SOORY MY BOSS IS BUSY PLEASE DONT CALL ME_*",
        DELETE_LINKS: "false",

        // ==================== AUTO FEATURES ====================
        AUTO_TYPING: "false",
        AUTO_STICKER: "false",
        AUTO_RECORDING: "false",
        AUTO_DOWNLOAD: "false",

        // ==================== BOT MODE ====================
        MODE: "public",
        BOTMODE: "button",
        PUBLIC_MODE: "true",
        ALWAYS_ONLINE: "false"
    };
}

// ================= GET CONFIG =================
function getConfig(key) {
    if (configLoaded && getGithub[key] !== undefined && getGithub[key] !== null) {
        return getGithub[key];
    }

    if (process.env[key] !== undefined) {
        return process.env[key];
    }

    if (staticConfig[key] !== undefined) {
        return staticConfig[key];
    }

    const defaults = getDefaultConfig();
    return defaults[key];
}

// ================= UPDATE CONFIG =================
async function updateConfig(key, value) {
    try {
        getGithub[key] = value;

        // 🔁 CHANGED: Save to Supabase
        await db.writeFile(
            'configDb.json',
            JSON.stringify(getGithub, null, 2),
            userFolder
        );

        fs.writeFileSync(
            './configDb.json',
            JSON.stringify(getGithub, null, 2)
        );

        return true;
    } catch (error) {
        return false;
    }
}

// ================= GET ALL =================
function getAllConfig() {
    const allConfig = { ...staticConfig, ...getDefaultConfig(), ...getGithub };

    Object.keys(process.env).forEach(key => {
        if (allConfig.hasOwnProperty(key)) {
            allConfig[key] = process.env[key];
        }
    });

    return allConfig;
}

// ================= EXPORT =================
const configModule = {
    get: getConfig,
    set: updateConfig,
    getAll: getAllConfig,
    init: loadConfig,
    setUserFolder,
    getUserFolder: () => userFolder,
    isGitHubLoaded: () => configLoaded // naam same rakha (no break)
};

// Backward compatibility getters
Object.keys(getDefaultConfig()).forEach(key => {
    Object.defineProperty(configModule, key, {
        get() { return this.get(key); }
    });
});

Object.keys(staticConfig).forEach(key => {
    Object.defineProperty(configModule, key, {
        get() { return staticConfig[key]; }
    });
});

module.exports = configModule;
