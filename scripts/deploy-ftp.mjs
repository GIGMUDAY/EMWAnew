import * as ftp from "basic-ftp";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const host = process.env.FTP_SERVER?.trim();
  const user = process.env.FTP_USERNAME?.trim();
  const password = process.env.FTP_PASSWORD?.trim();
  const port = parseInt(process.env.FTP_PORT?.trim() || "21", 10);
  const secure = process.env.FTP_PROTOCOL?.trim() === "ftps";
  const remoteDir = process.env.FTP_SERVER_DIR?.trim() || "public_html/";
  const localDir = path.resolve(process.cwd(), ".output/public");

  if (!host || !user || !password) {
    console.error("❌ Missing required FTP credentials: FTP_SERVER, FTP_USERNAME, or FTP_PASSWORD.");
    process.exit(1);
  }

  if (!fs.existsSync(localDir)) {
    console.error(`❌ Local directory not found: ${localDir}. Make sure 'npm run build' ran first.`);
    process.exit(1);
  }

  const client = new ftp.Client(30000); // 30s timeout
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

    console.log(`📂 Ensuring remote directory: ${remoteDir}`);
    await client.ensureDir(remoteDir);

    console.log(`🚀 Uploading build files from ${localDir} -> ${remoteDir}...`);
    await client.uploadFromDir(localDir);

    console.log("✅ Frontend deployed successfully to ethmwa.org!");
  } catch (err) {
    console.error("❌ Deployment failed with error:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();
