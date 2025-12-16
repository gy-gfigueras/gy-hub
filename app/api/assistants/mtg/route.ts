import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { ScryfallCard } from "./types";

// Scryfall API - API oficial de Magic: The Gathering
const SCRYFALL_BASE_URL = "https://api.scryfall.com";

// Helper para buscar cartas
async function searchCard(query: string) {
  try {
    const response = await fetch(
      `${SCRYFALL_BASE_URL}/cards/search?q=${encodeURIComponent(
        query
      )}&unique=cards&order=name`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { cards: [] };
      }
      return { error: `Error buscando carta: ${response.statusText}` };
    }

    const data = await response.json();
    return { cards: data.data || [] };
  } catch (error) {
    return { error: `Error al buscar carta: ${error}` };
  }
}

// Helper para búsqueda difusa (fuzzy) - permite nombres parciales
async function getCardByFuzzyName(name: string) {
  try {
    const response = await fetch(
      `${SCRYFALL_BASE_URL}/cards/named?fuzzy=${encodeURIComponent(name)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return { error: `Carta no encontrada: ${response.statusText}` };
    }

    const card = await response.json();
    return { card };
  } catch (error) {
    return { error: `Error al obtener carta: ${error}` };
  }
}

// Helper para búsqueda aleatoria
async function getRandomCard() {
  try {
    const response = await fetch(`${SCRYFALL_BASE_URL}/cards/random`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: `Error obteniendo carta aleatoria` };
    }

    const card = await response.json();
    return { card };
  } catch (error) {
    return { error: `Error: ${error}` };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = String(body?.prompt ?? "").trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    // 1. Usar Gemini para extraer la intención y el nombre de la carta
    const ai = new GoogleGenAI({ apiKey });
    const extractionPrompt = `
      Analiza el siguiente prompt de usuario relacionado con Magic: The Gathering.
      Tu objetivo es identificar si el usuario quiere:
      1. Una carta aleatoria.
      2. Buscar una carta específica (extrae el nombre más probable).
      3. Buscar cartas por características (keywords, colores, etc.).

      Prompt: "${prompt}"

      Responde SOLO con un objeto JSON con este formato:
      {
        "intent": "random" | "specific" | "search",
        "cardName": "nombre de la carta si es specific",
        "searchQuery": "query de búsqueda si es search"
      }
    `;

    const extractionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: extractionPrompt }],
    });

    const extractionText = (await extractionResponse.text) || "{}";
    let intentData;

    try {
      // Limpiar markdown si la IA lo incluye
      const jsonStr = extractionText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      intentData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Error parsing AI intent:", e);
      // Fallback básico
      if (
        prompt.toLowerCase().includes("aleatoria") ||
        prompt.toLowerCase().includes("random")
      ) {
        intentData = { intent: "random" };
      } else {
        intentData = { intent: "search", searchQuery: prompt };
      }
    }

    let resultData: {
      type: string;
      content?: string;
      card?: ScryfallCard;
      message?: string;
      totalFound?: number;
      explanation?: string;
    } = { type: "text", content: "" };

    if (intentData.intent === "random") {
      const result = await getRandomCard();
      if ("card" in result) {
        // Generar explicación con Gemini
        const explanation = await generateCardExplanation(result.card, ai);
        resultData = {
          type: "card_data",
          card: result.card,
          explanation,
        };
      } else {
        resultData = { type: "error", message: result.error };
      }
    } else if (intentData.intent === "specific" && intentData.cardName) {
      // Intentar fuzzy search primero
      const result = await getCardByFuzzyName(intentData.cardName);
      if ("card" in result) {
        // Generar explicación con Gemini
        const explanation = await generateCardExplanation(result.card, ai);
        resultData = {
          type: "card_data",
          card: result.card,
          explanation,
        };
      } else {
        // Fallback a búsqueda normal si falla fuzzy
        const searchResult = await searchCard(intentData.cardName);
        if ("cards" in searchResult && searchResult.cards.length > 0) {
          // Si hay una coincidencia exacta o muy cercana, usar la primera
          const explanation = await generateCardExplanation(
            searchResult.cards[0],
            ai
          );
          resultData = {
            type: "card_data",
            card: searchResult.cards[0],
            explanation,
          };
        } else {
          resultData = {
            type: "error",
            message: `No se encontró la carta "${intentData.cardName}"`,
          };
        }
      }
    } else if (intentData.intent === "search" && intentData.searchQuery) {
      // Búsqueda general, devolvemos lista o dejamos que la IA responda si es muy complejo
      // Por ahora, si es búsqueda, devolvemos la primera carta encontrada para simplificar el flujo visual
      // O podríamos devolver una lista. El requerimiento dice "mostrarlo formateado bonito".
      // Vamos a intentar buscar y si hay resultados, devolvemos el primero con un mensaje de que hay más.

      const searchResult = await searchCard(intentData.searchQuery);
      if ("cards" in searchResult && searchResult.cards.length > 0) {
        const explanation = await generateCardExplanation(
          searchResult.cards[0],
          ai
        );
        resultData = {
          type: "card_data",
          card: searchResult.cards[0],
          totalFound: searchResult.cards.length,
          explanation,
        };
      } else {
        // Si no hay cartas, dejamos que la IA responda texto normal
        resultData = {
          type: "text",
          content: "No encontré cartas con esos criterios.",
        };
      }
    }

    // Si tenemos datos de carta, devolvemos JSON estructurado
    if (resultData.type === "card_data") {
      return NextResponse.json(resultData);
    }

    // Si es error o texto, dejamos que la IA genere una respuesta conversacional
    // O simplemente devolvemos el error
    if (resultData.type === "error") {
      return NextResponse.json({
        text: `❌ Lo siento, hubo un problema: ${resultData.message}`,
      });
    }

    // Fallback a respuesta de texto normal de Gemini si no es una carta
    const systemPrompt = `Eres un experto en Magic: The Gathering. El usuario preguntó: "${prompt}". Responde de forma útil y concisa.`;
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: systemPrompt }],
    });

    return NextResponse.json({ text: await textResponse.text });
  } catch (error) {
    console.error("❌ MTG API error:", error);
    return NextResponse.json(
      { error: "Error procesando consulta de MTG" },
      { status: 500 }
    );
  }
}

// Helper para generar explicación de carta con Gemini
async function generateCardExplanation(
  card: ScryfallCard,
  ai: GoogleGenAI
): Promise<string> {
  const cardInfo = `
Nombre: ${card.name}
Coste de Maná: ${card.mana_cost || "N/A"}
Tipo: ${card.type_line}
Texto: ${card.oracle_text || "Sin texto"}
${
  card.power && card.toughness
    ? `Poder/Resistencia: ${card.power}/${card.toughness}`
    : ""
}
Rareza: ${card.rarity}
Colores: ${card.colors?.join(", ") || "Incoloro"}
Set: ${card.set_name}
Legalidades: ${
    Object.entries(card.legalities)
      .filter(([, v]) => v === "legal")
      .map(([k]) => k)
      .join(", ") || "Ninguna"
  }
`;

  const explanationPrompt = `Eres un experto en Magic: The Gathering. Analiza esta carta y proporciona una explicación concisa y útil:

${cardInfo}

Proporciona:
1. Una breve explicación de qué hace la carta (2-3 líneas máximo)
2. Menciona en qué tipo de mazos podría ser útil
3. Si tiene alguna sinergia o combo conocido, menciónalo brevemente

Sé conciso, directo y entusiasta. Máximo 4-5 líneas en total.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: explanationPrompt }],
    });

    return (await response.text) || "";
  } catch (error) {
    console.error("Error generating explanation:", error);
    return "";
  }
}
