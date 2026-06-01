import { useCallback, useId, useState } from "react";
import type { JudgmentResult, TurnResult } from "@ttj/phase-3-pipeline";
import { resolveFeatureFlags, type FeatureFlags } from "@ttj/phase-3-pipeline";
import {
  canShowJudgmentChip,
  createOrchestrator,
  waitForJudgmentResult,
} from "../lib/judgment-service.js";
import {
  detectStakesForConfirmation,
  metadataWithUsage,
  type StakesDetection,
  type UsageCategory,
} from "../lib/stakes.js";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  turn?: TurnResult;
  streaming?: boolean;
  judgment?: JudgmentResult | null;
  judgmentLoading?: boolean;
  confirmedUsage?: UsageCategory;
}

export interface PendingStakes {
  promptContent: string;
  detection: StakesDetection;
}

export function useChat() {
  const conversationId = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingStakes, setPendingStakes] = useState<PendingStakes | null>(null);
  const [stakesEditOpen, setStakesEditOpen] = useState(false);
  const [sessionUsage, setSessionUsage] = useState<UsageCategory | null>(null);
  const [busy, setBusy] = useState(false);
  const [judgmentExpanded, setJudgmentExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"assumptions" | "risks" | "verify">(
    "assumptions"
  );
  const [doneVerificationIds, setDoneVerificationIds] = useState<Set<string>>(
    new Set()
  );
  const [highlightVerificationFor, setHighlightVerificationFor] = useState<
    string | null
  >(null);
  const flags: FeatureFlags = resolveFeatureFlags();

  const runAnswerGeneration = useCallback(
    async (promptContent: string, usage: UsageCategory) => {
      const detection = detectStakesForConfirmation(promptContent);
      const metadata = metadataWithUsage(detection.metadata, usage);

      setSessionUsage(usage);

      const assistantId = `assistant-${Date.now()}`;
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
        judgmentLoading: true,
        confirmedUsage: usage,
      };

      setMessages((prev) => [...prev, assistantPlaceholder]);

      const orchestrator = createOrchestrator((partial) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: partial, streaming: true } : m
          )
        );
      });

      try {
        const turn = await orchestrator.executeTurn({
          conversationId,
          promptContent,
          metadata,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: turn.answer.content,
                  streaming: false,
                  turn,
                  judgmentLoading: turn.judgmentState === "pending",
                }
              : m
          )
        );

        orchestrator.onJudgmentComplete(turn.answer.id, (j) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, judgment: j, judgmentLoading: false }
                : m
            )
          );
        });

        const judgment = await waitForJudgmentResult(
          orchestrator,
          turn.answer.id
        );

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  judgment:
                    judgment ?? orchestrator.getJudgment(turn.answer.id) ?? null,
                  judgmentLoading: false,
                }
              : m
          )
        );
      } finally {
        setBusy(false);
      }
    },
    [conversationId]
  );

  const submitPrompt = useCallback(
    (promptContent: string) => {
      if (busy || pendingStakes) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: promptContent,
      };

      setMessages((prev) => [...prev, userMsg]);
      const detection = detectStakesForConfirmation(promptContent);
      if (sessionUsage) {
        detection.suggestedUsage = sessionUsage;
      }
      setPendingStakes({ promptContent, detection });
    },
    [busy, pendingStakes, sessionUsage]
  );

  const confirmStakes = useCallback(
    async (usage: UsageCategory) => {
      if (!pendingStakes) return;

      const { promptContent } = pendingStakes;
      setPendingStakes(null);
      setBusy(true);
      setJudgmentExpanded(false);
      setDoneVerificationIds(new Set());
      setHighlightVerificationFor(null);

      await runAnswerGeneration(promptContent, usage);
    },
    [pendingStakes, runAnswerGeneration]
  );

  const cancelStakes = useCallback(() => {
    setPendingStakes(null);
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      if (last?.role === "user") return prev.slice(0, -1);
      return prev;
    });
  }, []);

  const openStakesEditor = useCallback(() => {
    if (!sessionUsage) return;
    setStakesEditOpen(true);
  }, [sessionUsage]);

  const confirmStakesEdit = useCallback((usage: UsageCategory) => {
    setSessionUsage(usage);
    setStakesEditOpen(false);
  }, []);

  const cancelStakesEdit = useCallback(() => {
    setStakesEditOpen(false);
  }, []);

  const toggleVerificationDone = useCallback((id: string) => {
    setDoneVerificationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const latestAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  const showChip =
    latestAssistant?.judgment &&
    canShowJudgmentChip(flags, latestAssistant.judgment);

  const judgmentCounts = {
    assumptions: latestAssistant?.judgment?.assumptions.length ?? 0,
    risks: latestAssistant?.judgment?.risks.length ?? 0,
    verifications: latestAssistant?.judgment?.verifications.length ?? 0,
  };

  return {
    messages,
    busy,
    pendingStakes,
    stakesEditOpen,
    sessionUsage,
    submitPrompt,
    confirmStakes,
    cancelStakes,
    openStakesEditor,
    confirmStakesEdit,
    cancelStakesEdit,
    judgmentExpanded,
    setJudgmentExpanded,
    activeTab,
    setActiveTab,
    doneVerificationIds,
    toggleVerificationDone,
    highlightVerificationFor,
    setHighlightVerificationFor,
    latestAssistant,
    showChip: Boolean(showChip),
    judgmentLoading: latestAssistant?.judgmentLoading ?? false,
    judgmentCounts,
    isEmpty: messages.length === 0 && !pendingStakes,
  };
}
