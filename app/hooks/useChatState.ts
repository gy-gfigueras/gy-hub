import * as React from "react";
import { ScryfallCard } from "@/app/api/assistants/mtg/types";

type ChatResponse =
  | string
  | {
      type: string;
      card?: ScryfallCard;
      content?: string;
      text?: string;
      explanation?: string;
      totalFound?: number;
    };

interface UseChatStateProps {
  endpoint: string;
  onSuccess?: (response: ChatResponse) => void;
  onError?: (error: string) => void;
}

export function useChatState({
  endpoint,
  onSuccess,
  onError,
}: UseChatStateProps) {
  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [response, setResponse] = React.useState<ChatResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [selectedTopic, setSelectedTopic] = React.useState("");

  const send = React.useCallback(
    async (topic?: string) => {
      setError(null);
      setResponse(null);
      setCopied(false);

      if (!value.trim()) {
        setError("Escribe una pregunta");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: value,
            topic: topic || selectedTopic,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Error desconocido");

        // Manejar tanto respuestas de texto como estructuradas
        const responseData = data.text ? data.text : data;
        setResponse(responseData);
        onSuccess?.(responseData);
      } catch (e) {
        const errorMsg =
          e instanceof Error ? e.message : "Error al contactar con el modelo";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, value, selectedTopic, onSuccess, onError]
  );

  const copyToClipboard = React.useCallback(() => {
    if (response) {
      const textToCopy =
        typeof response === "string"
          ? response
          : JSON.stringify(response, null, 2);
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [response]);

  const reset = React.useCallback(() => {
    setValue("");
    setResponse(null);
    setError(null);
    setCopied(false);
  }, []);

  return {
    loading,
    value,
    setValue,
    response,
    error,
    copied,
    selectedTopic,
    setSelectedTopic,
    send,
    copyToClipboard,
    reset,
  };
}
