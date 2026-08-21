/**
 * Baker AI chatbot service.
 *
 * React -> n8n webhook
 *
 * Text and voice use the same n8n Baker Agent pipeline.
 */

const N8N_WEBHOOK_URL =
    import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;

const SESSION_STORAGE_KEY = "baker_session_id";
const CUSTOMER_STORAGE_KEY = "customerId";
const LANGUAGE_STORAGE_KEY = "language";
const WAKE_MODE_STORAGE_KEY = "baker_wake_mode";

export interface ChatProduct {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    currency?: string;
    original_price?: number;
}

export interface ChatOrder {
    id?: number;
    order_number?: string | number;
    status?: string;
    payment_status?: string;
    total?: number;
    subtotal?: number;
    delivery_charge?: number;
    discount?: number;
    grand_total?: number;
    currency?: string;
    [key: string]: unknown;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp: string;

    action?: "none" | "navigate" | "show_products" | "track_order";
    url?: string | null;

    products?: ChatProduct[];
    order?: ChatOrder | null;

    audioBase64?: string;
    audioMimeType?: string;
}

interface BakerResponse {
    assistant: string;
    status: "ok" | "error" | string;
    responded: boolean;

    session_id: string;
    customer_id: string;
    language: string;

    reply: string;

    reason?: string;
    detail?: string;

    action?: "none" | "navigate" | "show_products" | "track_order";
    url?: string | null;

    products?: ChatProduct[];
    order?: ChatOrder | null;

    audio_base64?: string;
    audio_mime_type?: string;

    timestamp?: string;
}

const getToken = (): string | null => {
    return localStorage.getItem("token");
};

const getCustomerId = (): string => {
    return localStorage.getItem(CUSTOMER_STORAGE_KEY) || "guest";
};

const getLanguage = (): string => {
    const language = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (language === "ar" || language?.startsWith("ar")) {
        return "ar";
    }

    return "en";
};

const getWakeMode = (): boolean => {
    return localStorage.getItem(WAKE_MODE_STORAGE_KEY) === "true";
};

const getOrCreateSessionId = (): string => {
    let id = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(SESSION_STORAGE_KEY, id);
    }

    return id;
};

export const resetChatSession = (): void => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
};

const createAssistantMessage = (
    data: BakerResponse
): ChatMessage => {
    return {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
            data.reply ||
            "Sorry, I couldn't process your request.",

        timestamp:
            data.timestamp ||
            new Date().toISOString(),

        action: data.action || "none",
        url: data.url ?? null,

        products: Array.isArray(data.products)
            ? data.products
            : [],

        order: data.order ?? null,

        audioBase64:
            data.audio_base64 || "",

        audioMimeType:
            data.audio_mime_type || "",
    };
};

const parseBakerResponse = async (
    response: Response
): Promise<BakerResponse> => {
    let data: BakerResponse | null = null;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            `Baker returned an invalid response (${response.status})`
        );
    }

    if (!response.ok) {
        throw new Error(
            data?.reply ||
            data?.detail ||
            `Chatbot request failed (${response.status})`
        );
    }

    return data;
};

const postToBaker = async (
    payload: Record<string, unknown>,
    signal?: AbortSignal
): Promise<ChatMessage> => {
    if (!N8N_WEBHOOK_URL) {
        throw new Error(
            "VITE_N8N_CHAT_WEBHOOK_URL is not configured."
        );
    }

    const response = await fetch(
        N8N_WEBHOOK_URL,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            signal,
            body: JSON.stringify(payload),
        }
    );

    const data = await parseBakerResponse(response);

    if (!data.responded) {
        return createAssistantMessage(data);
    }

    return createAssistantMessage(data);
};

export const sendChatMessage = async (
    message: string,
    options?: {
        signal?: AbortSignal;
    }
): Promise<ChatMessage> => {
    const text = message.trim();

    if (!text) {
        throw new Error("Message cannot be empty.");
    }

    return postToBaker(
        {
            session_id: getOrCreateSessionId(),
            customer_id: getCustomerId(),
            customer_message: text,
            language: getLanguage(),
            wake_mode: getWakeMode(),
            token: getToken(),
        },
        options?.signal
    );
};

const blobToBase64 = (
    blob: Blob
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            const result = String(reader.result || "");

            const commaIndex = result.indexOf(",");

            if (commaIndex === -1) {
                reject(
                    new Error("Could not encode audio.")
                );
                return;
            }

            resolve(result.slice(commaIndex + 1));
        };

        reader.onerror = () => {
            reject(
                new Error("Could not read recorded audio.")
            );
        };

        reader.readAsDataURL(blob);
    });
};

export const sendVoiceMessage = async (
    audioBlob: Blob,
    options?: {
        signal?: AbortSignal;
    }
): Promise<ChatMessage> => {
    if (!audioBlob || audioBlob.size === 0) {
        throw new Error("Recorded audio is empty.");
    }

    // Keep recordings comfortably below the transcription limit.
    if (audioBlob.size > 10 * 1024 * 1024) {
        throw new Error(
            "Voice recording is too large. Please record a shorter message."
        );
    }

    const audioBase64 =
        await blobToBase64(audioBlob);

    return postToBaker(
        {
            session_id: getOrCreateSessionId(),
            customer_id: getCustomerId(),
            customer_message: "",
            language: getLanguage(),
            wake_mode: getWakeMode(),
            token: getToken(),
            audio_base64: audioBase64,
        },
        options?.signal
    );
};

export const playBakerAudio = (
    audioBase64: string,
    mimeType = "audio/mpeg"
): HTMLAudioElement | null => {
    if (!audioBase64) {
        return null;
    }

    const cleanBase64 =
        audioBase64.includes(",")
            ? audioBase64.split(",").pop() || ""
            : audioBase64;

    try {
        const binary = atob(cleanBase64);

        const bytes = new Uint8Array(
            binary.length
        );

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const blob = new Blob(
            [bytes],
            {
                type: mimeType || "audio/mpeg",
            }
        );

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        audio.onended = () => {
            URL.revokeObjectURL(url);
        };

        audio.onerror = () => {
            URL.revokeObjectURL(url);
        };

        void audio.play();

        return audio;
    } catch {
        return null;
    }
};