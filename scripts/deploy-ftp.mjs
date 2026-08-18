import * as ftp from "basic-ftp";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const host = process.env.FTP_SERVER?.trim();
  const user = process.env.FTP_USERNAME?.trim();
  const password = process.env.FTP_PASSWORD?.trim();
  const port = parseInt(process.env.FTP_PORT?.trim() || "21", 10);
  const secure = process.env.FTP_PROTOCOL?.trim() === "ftps";
  let targetDir = process.env.FTP_SERVER_DIR?.trim() || "public_html/";
  const localDir = path.resolve(process.cwd(), ".output/public");

  if (!host || !user || !password) {
    console.error("❌ Missing required FTP credentials: FTP_SERVER, FTP_USERNAME, or FTP_PASSWORD.");
    process.exit(1);
  }

  if (!fs.existsSync(localDir)) {
    console.error(`❌ Local directory not found: ${localDir}. Make sure 'npm run build' ran first.`);
    process.exit(1);
  }

  const client = new ftp.Client(60000);
  client.ftp.verbose = true;

  try {
    console.log(`📡 Connecting to FTP server: ${host}:${port} (secure: ${secure})...`);
    await client.access({
      host,
      user,
      password,
      port,
      secure,
      secureOptions: { rejectUnauthorized: false },
    });

    const initialPwd = await client.pwd();
    console.log(`📍 Current FTP remote working directory: ${initialPwd}`);

    const rootListing = await client.list();
    console.log("📂 Current directory contents:", rootListing.map((i) => `${i.isDirectory ? "[DIR]" : "[FILE]"} ${i.name}`).join(", "));

    const hasPublicHtml = rootListing.some((item) => item.name.toLowerCase() === "public_html" && item.isDirectory);

    if (hasPublicHtml) {
      targetDir = "public_html/";
    } else if (rootListing.some((item) => item.name.toLowerCase() === "index.html" || item.name.toLowerCase() === "assets")) {
      targetDir = "./";
    }

    console.log(`📂 Ensuring and navigating to target directory: ${targetDir}`);
    await client.ensureDir(targetDir);

    console.log(`🚀 Uploading build files from ${localDir} -> ${targetDir}...`);
    await client.uploadFromDir(localDir);

    const postUploadListing = await client.list();
    console.log("📋 Uploaded directory contents:", postUploadListing.map((i) => `${i.isDirectory ? "[DIR]" : "[FILE]"} ${i.name}`).join(", "));

    console.log("✅ Frontend deployed successfully to ethmwa.org!");
  } catch (err) {
    console.error("❌ Deployment failed with error:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
