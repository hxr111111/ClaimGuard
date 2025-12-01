import { GoogleGenAI } from "@google/genai";
import { ExpenseLineItem } from "../types";

const apiKey = process.env.API_KEY || 'AIzaSyBou1aBCysx0POxT1CdJfd0wr8f_pZd8bg';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert File to Base64
const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const parseReceipt = async (file: File): Promise<Partial<ExpenseLineItem> | null> => {
  if (!apiKey) return null;

  try {
    const imagePart = await fileToPart(file);
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Analyze this receipt/invoice image. Extract the following details into a valid JSON object.
      
      Fields required:
      - date: YYYY-MM-DD format
      - amount: number (total)
      - expenseItem: Best matching category from [Meals, Travel, Lodging, Mileage, Office Supplies, Entertainment, Medical, Other]
      - memo: Merchant name and brief description
      - businessReason: Infer a generic business reason based on the item (e.g., "Client Meeting", "Travel Supplies")

      Return ONLY the JSON. Do not include markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [imagePart, { text: prompt }]
      }
    });

    const text = response.text?.trim() || "";
    // Clean markdown code blocks if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Receipt Parsing Failed:", error);
    return null;
  }
};

export const extractPolicyRules = async (file: File): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    const filePart = await fileToPart(file);
    const model = "gemini-2.5-flash"; // Capable of reading text from images/PDFs

    const prompt = `
      You are a policy analyst. Read the attached policy document image/file.
      Extract a concise list of expense compliance rules, limits, and prohibitions.
      Format it as a simple numbered list of rules.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [filePart, { text: prompt }]
      }
    });

    return response.text?.trim() || null;
  } catch (error) {
    console.error("Policy Extraction Failed:", error);
    return null;
  }
};

export const checkPolicyCompliance = async (
  item: Partial<ExpenseLineItem>,
  customPolicyRules?: string
): Promise<string | null> => {
  if (!apiKey) return "API Key missing. Cannot validate policy.";

  try {
    const model = "gemini-2.5-flash";
    
    const defaultRules = `
      1. Expenses over $75 require a receipt.
      2. Mileage is reimbursed at $0.545/mile.
      3. "Entertainment" or "Meals" over $100 per person requires a list of attendees.
      4. No "Gifts" over $50 allowed.
      5. "Medical" claims must be strictly business related.
    `;

    const activePolicy = customPolicyRules 
      ? `CUSTOM POLICY RULES UPLOADED BY USER:\n${customPolicyRules}` 
      : `STANDARD AVO.AI POLICY:\n${defaultRules}`;

    const prompt = `
      You are a strict corporate expense compliance officer.
      Review the expense line item against the active policy below.

      ${activePolicy}

      Item Details:
      Category: ${item.expenseItem}
      Amount: $${item.amount}
      Memo: ${item.memo}
      Business Reason: ${item.businessReason}
      Receipt Attached: ${item.receiptAttached ? 'Yes' : 'No'}

      If there is a violation or risk based strictly on the policy provided, explain it in 1 sentence.
      If it looks compliant, return exactly "COMPLIANT".
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text === "COMPLIANT") return null;
    return text || "Unable to verify compliance.";
  } catch (error) {
    console.error("Gemini Policy Check Failed:", error);
    return "AI Policy Check unavailable.";
  }
};
