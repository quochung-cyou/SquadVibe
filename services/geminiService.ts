
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Place, GarmentCategory, Garment } from "../types";

// Helper to get fresh AI instance with current key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to convert base64 to API part format
const base64ToPart = (base64String: string) => {
    const match = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid base64 string format");
    }
    return {
        inlineData: {
            mimeType: match[1],
            data: match[2]
        }
    };
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const urlToBase64 = async (url: string): Promise<string> => {
    console.log(`[Gemini Service] Converting URL: ${url.substring(0, 30)}...`);

    const isValidImage = (blob: Blob) => {
        const isImage = blob.type.startsWith('image/');
        const isLargeEnough = blob.size > 2000; 
        return isImage && isLargeEnough;
    };

    if (url.startsWith('data:')) return url;
    
    try {
        const response = await fetch(url);
        if (response.ok) {
            const blob = await response.blob();
            if (isValidImage(blob)) {
                return await blobToBase64(blob);
            }
        }
    } catch (e) { /* Ignore direct fetch failure */ }

    // Use specific proxy for robustness
    const proxyUrl = `https://corsiimagedownloadd.ctbkod1612.workers.dev/?url=${encodeURIComponent(url)}`;

    try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
            const blob = await response.blob();
            if (isValidImage(blob)) {
                 return await blobToBase64(blob);
            }
        }
    } catch (e) {
        console.warn(`[Gemini Service] Proxy attempt failed`, e);
    }

    throw new Error("Unable to load the high-quality background image.");
};

const fetchRealImages = async (query: string): Promise<string[]> => {
    try {
        // Append "aesthetic" or "interior" to get better vibe shots for places
        const res = await fetch(`https://raspy-cloud-2452.ctbkod1612.workers.dev?q=aesthetic photo of ${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
            return data.items
                .map((item: any) => item.link)
                .filter((link: string) => link.match(/\.(jpeg|jpg|png|webp)$/i))
                .slice(0, 4); 
        }
        return [];
    } catch (e) {
        console.error("Image search failed", e);
        return [];
    }
}

export interface RenderSubject {
    memberId: string;
    memberImageBase64: string;
    garmentImageBase64: string;
    garmentCategory: string;
}

export interface RenderConfig {
    modelVersion: '2.5' | '3.0';
}

// --- PHASE 1: DRESS THE MEMBER ---
export const generateDressedMember = async (subject: RenderSubject, config: RenderConfig): Promise<{id: string, img: string}> => {
    console.log(`[Gemini Service] Phase 1: Dressing member ${subject.memberId}`);
    
    const modelName = config.modelVersion === '2.5' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
    
    const parts = [
        base64ToPart(subject.memberImageBase64),
        base64ToPart(subject.garmentImageBase64)
    ];

    const prompt = `You are a professional fashion editor.
    Input 1: A person.
    Input 2: A ${subject.garmentCategory} garment.

    Task: Generate a photo of the person from Input 1 wearing the garment from Input 2.
    - Ensure the fit is realistic and tailored.
    - PRESERVE the person's face and body identity exactly.
    - Output ONLY the person on a simple white background.
    - Do not crop the head or feet. Full body shot.`;

    const response = await getAI().models.generateContent({
        model: modelName,
        contents: {
            parts: [...parts, { text: prompt }]
        },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData?.data) {
        return {
            id: subject.memberId,
            img: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
        };
    }
    throw new Error(`Failed to dress member ${subject.memberId}`);
};

// --- PHASE 2: SCENE COMPOSITION ---
export const generateSceneComposition = async (
    dressedMembers: { id: string, img: string }[], // Array of base64 images from Phase 1
    sceneContext: string,
    backgroundImageUrl?: string,
    config: RenderConfig = { modelVersion: '3.0' }
): Promise<string> => {
    console.log(`[Gemini Service] Phase 2: Composing Scene. Model: ${config.modelVersion}`);

    const parts: any[] = [];
    let promptInputs = "";
    let inputIndex = 1;

    // Add Background
    let hasRealBackground = false;
    
    if (backgroundImageUrl) {
        try {
            const bgBase64 = await urlToBase64(backgroundImageUrl);
            parts.push(base64ToPart(bgBase64));
            hasRealBackground = true;
            promptInputs += `Input Image ${inputIndex}: BACKGROUND SCENE.\n`;
            inputIndex++;
        } catch (e) {
            console.error("[Gemini Service] Failed to load background image:", e);
            throw new Error("Failed to load the selected background scene.");
        }
    }

    // Add Dressed Members
    dressedMembers.forEach((m, idx) => {
        parts.push(base64ToPart(m.img));
        promptInputs += `Input Image ${inputIndex}: Model ${idx + 1} (Reference Identity & Outfit).\n`;
        inputIndex++;
    });

    let prompt = `You are a visionary digital compositor and photographer.
    Task: Create a seamless, photorealistic composition.
    
    ${promptInputs}

    Follow this "Chain of Thought" to generate the image:

    1.  **ANALYZE THE SCENE (Input 1):**
        -   Look at the perspective (eye-level, drone, low angle?).
        -   Understand the lighting (soft, harsh, neon, daylight?).
        -   Identify physical geometry (stairs, walls, chairs, open street?).
        -   **SCALE REFERENCE:** Identify known objects (doors, cars, chairs) to determine the correct scale for a human.

    2.  **INTEGRATE THE MODELS (Input ${hasRealBackground ? '2+' : '1+'}):**
        -   **STRICT REQUIREMENT:** You MUST Preserve the facial identity of the Models exactly.
        -   **POSE FREEDOM:** You are FREE to change the body pose of the models to fit the scene vibe.
            -   **DO NOT just paste them standing straight.**
            -   If it's a chill cafe, make them sit or lean on a table.
            -   If it's a street, make them walk naturally or turn back.
            -   If there's a wall, they can lean on it.
        -   **SCALE & PLACEMENT:** Place the models on the *ground plane* correctly. Do not make them float or look giant/tiny. Use shadows to ground them.
        -   **OUTFIT PRESERVATION:** Keep the clothing style and texture consistent with the input, but adjust folds/drape for the new pose.

    3.  **FINALIZE COMPOSITION:**
        -   ${hasRealBackground ? 'Use Input 1 as the EXACT background canvas.' : 'Create a realistic background based on the description.'}
        -   Match the shadows, color grading, and noise grain perfectly.
        -   The final image should look like a high-end lifestyle photograph.
    `;

    if (sceneContext) {
        prompt += `\nContext/Vibe of scene: "${sceneContext}". Ensure the models' attitude matches this vibe.`;
    }

    prompt += `\nReturn ONLY the final composited image.`;

    const modelName = config.modelVersion === '2.5' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';

    const response = await getAI().models.generateContent({
        model: modelName,
        contents: {
            parts: [ ...parts, { text: prompt } ]
        },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (imagePart?.inlineData?.data) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    
    throw new Error("No image generated in Phase 2.");
};

// Legacy wrapper if needed, but we encourage using the split functions
export const generateVirtualTryOn = async (
    subjects: RenderSubject[],
    locationContext?: string,
    backgroundImageUrl?: string,
    config: RenderConfig = { modelVersion: '3.0' },
    onProgress?: (dressedMembers: Record<string, string>) => void
): Promise<string> => {
    // 1. Dress
    const tryOnPromises = subjects.map(s => generateDressedMember(s, config));
    const tryOnResults = await Promise.all(tryOnPromises);
    
    const dressedMap: Record<string, string> = {};
    const dressedArray: { id: string, img: string }[] = [];
    
    tryOnResults.forEach(res => {
        dressedMap[res.id] = res.img;
        dressedArray.push(res);
    });

    if (onProgress) onProgress(dressedMap);

    // 2. Composite
    return await generateSceneComposition(
        dressedArray, 
        locationContext || "", 
        backgroundImageUrl, 
        config
    );
};

export const recommendAttire = async (placeDescription: string, closet: Garment[]): Promise<string[]> => {
    try {
        if (closet.length === 0) return [];
        const closetSummary = closet.map(g => ({ id: g.id, name: g.name, category: g.category, color: g.color, tags: g.tags }));
        const prompt = `I am going to a place with this vibe: "${placeDescription}". Here is my closet: ${JSON.stringify(closetSummary)}. Select the top 3 items. Return ONLY a JSON array of "id" strings.`;
        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }
        });
        return response.text ? JSON.parse(response.text) : [];
    } catch (e) { return []; }
};

export const searchPlaces = async (query: string, placeId?: string): Promise<Place[]> => {
    try {
        let prompt = "";
        
        // Handle Coordinate/POI clicks specifically
        if (query.startsWith("COORDS:")) {
             const coords = query.replace("COORDS:", "");
             prompt = `
             Context: User clicked a map point at coordinates ${coords}. ${placeId ? `Google Place ID: ${placeId}` : ''}
             Task: Identify the specific place at this location.
             
             Return a JSON array containing:
             1. The exact place at this location (Name, Vibe, Description).
             2. Up to 2 nearby recommended interesting spots (within 200m).
             `;
        } else {
             // Handle Text Search (Address, Name, or Vibe)
             prompt = `
             You are an expert Local Guide and Travel Concierge.
             User Input: "${query}"

             Task: Search for real-world locations based on the user's input. Return a JSON array.

             Rules:
             1. **EXACT ADDRESS/NAME MATCHING**: If the input looks like a specific address (e.g., "123 Main St") or a specific venue name (e.g., "The Note Coffee"), your FIRST result MUST be that exact place. Do not recommend generic "top places" instead.
             2. **VIBE/CATEGORY SEARCH**: If the input is broad (e.g., "coffee", "cyberpunk streets"), recommend 3-4 top-rated, specific locations that fit the vibe.
             3. **ACCURACY**: Ensure Latitude/Longitude are accurate for the specific place found.

             Few-Shot Examples:
             
             Example 1 (Specific Address):
             Input: "64 P. Lương Văn Can, Hàng Trống, Hoàn Kiếm, Hà Nội"
             Output: [{"name": "The Note Coffee", "description": "Famous cafe covered in post-it notes with lake views, located exactly at this address.", "lat": 21.0326, "lng": 105.8528, "suggestedAttire": "Casual, colorful", "bestTime": "Morning", "tips": "Write a note!"}]

             Example 2 (Specific Name):
             Input: "Eiffel Tower"
             Output: [{"name": "Eiffel Tower", "description": "Iconic iron lattice tower on the Champ de Mars.", "lat": 48.8584, "lng": 2.2945, "suggestedAttire": "Chic & Comfortable", "bestTime": "Sunset", "tips": "Book tickets in advance."}]

             Example 3 (Vibe Search):
             Input: "Hidden Jazz Bars in Tokyo"
             Output: [
                {"name": "Bar Trench", "description": "Sophisticated craft cocktails and jazz.", "lat": 35.6486, "lng": 139.7066, "suggestedAttire": "Smart Casual", "bestTime": "Evening", "tips": "Try the absinthe."},
                {"name": "Blue Note Tokyo", "description": "Famous upscale jazz club.", "lat": 35.6607, "lng": 139.7153, "suggestedAttire": "Formal", "bestTime": "Night", "tips": "Check schedule."}
             ]

             Analyze the User Input and generate the JSON response.
             `;
        }

        const response = await getAI().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            lat: { type: Type.NUMBER },
                            lng: { type: Type.NUMBER },
                            suggestedAttire: { type: Type.STRING },
                            bestTime: { type: Type.STRING },
                            tips: { type: Type.STRING }
                        },
                        required: ["name", "description", "lat", "lng", "suggestedAttire", "bestTime", "tips"]
                    }
                }
            }
        });
        const text = response.text;
        if (!text) return [];
        const placesData = JSON.parse(text);
        return await Promise.all(placesData.map(async (p: any, i: number) => {
            const searchName = p.name.replace(/[^a-zA-Z0-9 ]/g, ' ');
            const images = await fetchRealImages(searchName);
            return {
                id: `p-${i}-${Date.now()}`,
                name: p.name,
                description: p.description,
                lat: p.lat,
                lng: p.lng,
                imageUrls: images.length > 0 ? images : [], 
                suggestedAttire: p.suggestedAttire,
                bestTime: p.bestTime,
                tips: p.tips
            };
        }));
    } catch (e: any) {
        if (e.message?.includes("503") || e.status === 503) throw new Error("Model overloaded. Please try again later.");
        return [];
    }
};

export const generateBaseModel = async (photoBase64: string, instructions?: string, modelVersion: string = '3.0'): Promise<string> => {
    try {
        const model = modelVersion === '2.5' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';
        const prompt = `You are an expert fashion photographer AI. Task: Regenerate this person into a professional full-body model standing pose. Instructions: Retain the person's exact face, hair, and body type. ${instructions ? `Custom pose: ${instructions}` : 'Pose: Full frontal, confident standing.'} Clean studio background. High quality. Return ONLY the image.`;
        const response = await getAI().models.generateContent({
            model: model,
            contents: { parts: [base64ToPart(photoBase64), { text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] }
        });
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData?.data) return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        throw new Error("Failed to generate base model.");
    } catch (error: any) {
        if (error.status === 403 || error.message?.includes("PERMISSION_DENIED")) throw new Error(`Permission denied for model ${modelVersion}.`);
        throw error;
    }
};

export const analyzeGarment = async (photoBase64: string, hint?: string, modelVersion: string = '3.0'): Promise<{ category: GarmentCategory, color: string, tags: string[] }> => {
    try {
        const model = modelVersion === '2.5' ? 'gemini-2.5-flash' : 'gemini-3-pro-preview';
        
        // Use a few-shot prompt strategy to ensure the model understands the JSON output requirement clearly
        const prompt = `
        You are a professional fashion stylist. Analyze the clothing item shown in the image.
        
        Rules:
        1. Identify the 'category' from this list: Tops, Bottoms, Outerwear, Shoes, Accessories. (Do not use 'All').
        2. Identify the dominant 'color'.
        3. Generate 3 descriptive 'tags' (e.g., material, style, occasion).

        Few-shot Examples:
        - Input: Blue Denim Jeans
        - Output: { "category": "Bottoms", "color": "Blue", "tags": ["Denim", "Casual", "Streetwear"] }
        
        - Input: Black Leather Jacket
        - Output: { "category": "Outerwear", "color": "Black", "tags": ["Leather", "Biker", "Winter"] }
        
        - Input: Red Silk Scarf
        - Output: { "category": "Accessories", "color": "Red", "tags": ["Silk", "Elegant", "Patterned"] }

        ${hint ? `User Hint: "${hint}".` : ''}
        
        Analyze the provided image and return the JSON object conforming to the schema.
        `;

        const response = await getAI().models.generateContent({
            model: model,
            contents: { parts: [base64ToPart(photoBase64), { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, enum: Object.values(GarmentCategory).filter(c => c !== 'All') },
                        color: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["category", "color", "tags"]
                }
            }
        });
        if (response.text) return JSON.parse(response.text);
        throw new Error("Failed to analyze garment.");
    } catch (error: any) {
         if (error.status === 403 || error.message?.includes("PERMISSION_DENIED")) throw new Error(`Permission denied for model ${modelVersion}.`);
        throw error;
    }
};
