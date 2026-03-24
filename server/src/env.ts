// This file must be imported FIRST in index.ts.
// It loads all environment variables from the root .env before any service
// modules execute their top-level code (e.g. Azure OpenAI client init).
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
