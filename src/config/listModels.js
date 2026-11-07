import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const models = await groq.models.list();
models.data.forEach((m) => console.log(m.id));