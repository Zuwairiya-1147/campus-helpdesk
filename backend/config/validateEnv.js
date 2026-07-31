const REQUIRED_VARS = ["MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key] || process.env[key].trim() === "");

  if (missing.length > 0) {
    console.error("\n❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\nCreate a .env file (see .env.example) and set these before starting the server.\n");
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 16) {
    console.warn(
      "⚠️  JWT_SECRET is short. Use a longer, random string in production for better security."
    );
  }
};

module.exports = validateEnv;
