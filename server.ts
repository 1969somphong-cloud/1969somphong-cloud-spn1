import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize Google GenAI with required telemetry User-Agent
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // AI Meteorological Risk Analysis endpoint
  app.post('/api/gemini/analyze-weather', async (req, res) => {
    try {
      const { weatherData, locationName, alertThresholds } = req.body;
      if (!weatherData) {
        return res.status(400).json({ error: 'Missing weatherData parameter' });
      }

      const prompt = `คุณคือผู้เชี่ยวชาญระดับสูงด้านอุตุนิยมวิทยาและระบบเตือนภัยพิบัติฉุกเฉิน (Chief Meteorological Risk Specialist)
กรุณาวิเคราะห์ข้อมูลสภาพอากาศปัจจุบัน การตรวจวัดเรดาร์ และการพยากรณ์ล่วงหน้าสำหรับพื้นที่ "${locationName || 'พื้นที่เป้าหมาย'}":

ข้อมูลพารามิเตอร์ทางอุตุนิยมวิทยา:
${JSON.stringify(weatherData, null, 2)}

เกณฑ์ตรวจจับเตือนภัย:
${JSON.stringify(alertThresholds || {}, null, 2)}

โปรดสร้างบทวิเคราะห์ความเสี่ยงที่แม่นยำ พร้อมคำแนะนำเตือนภัยที่เป็นมาตรฐานสากล (WMO / ปภ. ประเทศไทย) เป็นภาษาไทย โดยตอบกลับเป็น JSON ตามรูปแบบนี้เท่านั้น:
{
  "alertLevel": "NORMAL" | "WATCH" | "WARNING" | "CRITICAL_EMERGENCY",
  "alertLevelTh": "ปกติ" | "เฝ้าระวัง" | "เตือนภัย" | "เตือนภัยขั้นสูงสุด",
  "headline": "หัวข้อประกาศเตือนภัยสั้นกระชับ ตรงประเด็น และชัดเจน",
  "situationSummary": "สรุปวิเคราะห์สภาวะอากาศปัจจุบัน สิ่งที่ตรวจพบ และแนวโน้มใน 24 ชั่วโมงข้างหน้า (3-4 ประโยค)",
  "riskFactors": [
    {
      "type": "ฝนตกหนัก/น้ำท่วมฉับพลัน" | "ลมกระโชกแรง/พายุฤดูร้อน" | "ฟ้าผ่า/ลูกเห็บ" | "ดัชนีความร้อนวิกฤต" | "มลพิษฝุ่น PM2.5",
      "riskPercentage": 0-100,
      "severity": "LOW" | "MODERATE" | "HIGH" | "SEVERE",
      "description": "คำอธิบายความเสี่ยงเฉพาะด้าน พร้อมตัวเลขสำคัญ"
    }
  ],
  "actionableAdvice": [
    "ข้อควรปฏิบัติด่วนข้อที่ 1",
    "ข้อควรปฏิบัติด่วนข้อที่ 2",
    "ข้อควรปฏิบัติด่วนข้อที่ 3"
  ],
  "vulnerableGroupsAdvice": "คำแนะนำพิเศษสำหรับกลุ่มเปราะบาง (ผู้สูงอายุ, เด็กเล็ก, ผู้ป่วย, เกษตรกร, ก่อสร้างกลางแจ้ง, หรือเรือประมง)",
  "evacuationPreparedness": "คำแนะนำการเตรียมตัวอพยพ กระเป๋าฉุกเฉิน หรือการเคลื่อนย้ายยานพาหนะ",
  "timelineForecast": "ระบุช่วงเวลาวิกฤตที่สุดที่ต้องเฝ้าระวังอย่างใกล้ชิด"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Gemini weather analysis error:', err);
      return res.status(500).json({
        error: 'Failed to generate weather analysis',
        message: err?.message || 'Unknown error',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // In development, hook Vite into express middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VAYU Alert fullstack server running on port ${PORT}`);
  });
}

startServer();
