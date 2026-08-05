/**
 * chatbotService.ts
 *
 * Baker AI Client
 *
 * React -> n8n Webhook
 *
 * n8n orchestrates the AI workflow and forwards the JWT to Flask tool APIs.
 * React never communicates directly with Flask for chatbot interactions.
 */

const N8N_WEBHOOK_URL =
    import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL ??
    "https://n8n.cakentake.com/webhook/baker-chat";

const SESSION_STORAGE_KEY = "baker_session_id";

const CUSTOMER_STORAGE_KEY = "customer_id";

const LANGUAGE_STORAGE_KEY = "language";

export interface ChatProduct {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    product_url?: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp: string;

    redirectUrl?: string;
    redirectLabel?: string;

    products?: ChatProduct[];
}

interface BakerResponse {

    assistant: string;

    status: string;

    responded: boolean;

    session_id: string;

    customer_id: string;

    language: string;

    reply: string;

    redirectUrl?: string;

    redirectLabel?: string;

    products?: ChatProduct[];

    timestamp?: string;
}

/**
 * Returns JWT generated during login.
 */
const getToken = (): string | null => {

    return localStorage.getItem("token");

};

/**
 * Returns customer id if logged in.
 */
const getCustomerId = (): string => {

    return (

        localStorage.getItem(CUSTOMER_STORAGE_KEY)

        ||

        "guest"

    );

};

/**
 * Gets preferred language.
 */
const getLanguage = (): string => {

    return (

        localStorage.getItem(LANGUAGE_STORAGE_KEY)

        ||

        "en"

    );

};

/**
 * Creates persistent conversation session.
 */
const getOrCreateSessionId = (): string => {

    let id = localStorage.getItem(SESSION_STORAGE_KEY);

    if (!id) {

        id = crypto.randomUUID();

        localStorage.setItem(

            SESSION_STORAGE_KEY,

            id

        );

    }

    return id;

};

export const resetChatSession = () => {

    localStorage.removeItem(

        SESSION_STORAGE_KEY

    );

};

export const sendChatMessage = async (

    message: string,

    options?: {

        signal?: AbortSignal;

    }

): Promise<ChatMessage> => {

    const response = await fetch(

        N8N_WEBHOOK_URL,

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

            },

            signal: options?.signal,

            body: JSON.stringify({

                session_id: getOrCreateSessionId(),

                customer_id: getCustomerId(),

                customer_message: message,

                language: getLanguage(),

                wake_mode: false,

                token: getToken()

            })

        }

    );

    if (!response.ok) {

        throw new Error(

            `Chatbot request failed (${response.status})`

        );

    }

    const data: BakerResponse = await response.json();

    return {

        id: crypto.randomUUID(),

        role: "assistant",

        text:

            data.reply ||

            "Sorry, I couldn't process your request.",

        timestamp:

            data.timestamp ||

            new Date().toISOString(),

        redirectUrl:

            data.redirectUrl,

        redirectLabel:

            data.redirectLabel,

        products:

            data.products

    };

};