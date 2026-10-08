
import "dotenv/config";

import express from "express";
import multer from "multer";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;

const app = express();
const upload = multer({
    limits: {
        fileSize: 10_000_000
    }
});
const ai = new GoogleGenAI();

// initial app
app
    .use(upload.single('file'))
    // method chaining
    .use(cors())
    .use(express.json())

    // initial routes + handler
    .post("/api/generate-text", async (req, res) => {
        const { prompt } = req.body;

        try {
            const response = await ai.interactions.create({
                model: 'gemini-3.1-flash-lite',
                input: prompt,
                system_instruction: "" // Add persona
            });

            return res.status(200).json({
                success: true,
                message: response.output_text
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: e.message });
        }
    })

    .post("/api/process-media", async (req, res) => {
        const { prompt } = req.body;
        const base64File = req.file.buffer.toString("base64");

        const mimeType = req.file?.mimetype || "";
        let fileType = "document";
        if (mimeType.startsWith("image/")) {
            fileType = "image"
        } else if (mimeType.startsWith("audio/")) {
            fileType = "audio"
        } else if (mimeType.startsWith("video/")) {
            fileType = "video"
        }

        try {
            const response = await ai.interactions.create({
                model: 'gemini-3.1-flash-lite',
                input: [
                    { type: "text", text: prompt },
                    { type: fileType, data: base64File, mime_type: req.file.mimetype }
                ]
            });

            return res.status(200).json({
                success: true,
                message: response.output_text
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: e.message });
        }
    })

    // result
    .listen(PORT, () => {
        console.log("Bungkus di port ", PORT);
    })