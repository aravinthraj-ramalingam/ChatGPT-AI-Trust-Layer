import { UserMessage } from "../components/UserMessage.js";
import { AnswerView } from "../components/AnswerView.js";
import { PromptComposer } from "../components/PromptComposer.js";
import { JudgmentChip } from "../components/JudgmentChip.js";
import { JudgmentPanel } from "../components/JudgmentPanel.js";
import { StakesConfirmation } from "../components/StakesConfirmation.js";
import { useChat } from "../hooks/useChat.js";
import { submitLayerFeedback } from "../lib/feedback-client.js";

/** Main chat — ChatGPT-style layout + stakes confirmation */
export function ChatPage() {
  const chat = useChat();

  const composerProps = {
    onSubmit: chat.submitPrompt,
    disabled: chat.busy || Boolean(chat.pendingStakes),
    selectedUsage: chat.sessionUsage,
    onChangeStakes: chat.sessionUsage ? chat.openStakesEditor : undefined,
  };

  return (
    <div className="chat-layout">
      <div className={`chat-main${chat.isEmpty ? " chat-main--empty" : ""}`}>
        {chat.isEmpty ? (
          <div className="empty-hero">
            <h2>What are you working on?</h2>
            <div className="prompt-center">
              <PromptComposer {...composerProps} variant="hero" />
            </div>
          </div>
        ) : (
          <>
            <div className="messages" role="log" aria-label="Conversation">
              {chat.messages.map((msg) =>
                msg.role === "user" ? (
                  <UserMessage key={msg.id} content={msg.content} />
                ) : (
                  <div key={msg.id} className="assistant-block">
                    <AnswerView content={msg.content} streaming={msg.streaming} />
                    {msg.id === chat.latestAssistant?.id &&
                    (chat.judgmentLoading || chat.showChip || msg.judgment) ? (
                      <>
                        <JudgmentChip
                          counts={
                            msg.judgment
                              ? {
                                  assumptions: msg.judgment.assumptions.length,
                                  risks: msg.judgment.risks.length,
                                  verifications: msg.judgment.verifications.length,
                                }
                              : chat.judgmentCounts
                          }
                          expanded={chat.judgmentExpanded}
                          loading={
                            msg.id === chat.latestAssistant?.id &&
                            chat.judgmentLoading
                          }
                          onToggle={() => chat.setJudgmentExpanded((e) => !e)}
                        />
                        {chat.judgmentExpanded &&
                          msg.judgment &&
                          msg.id === chat.latestAssistant?.id && (
                            <JudgmentPanel
                              judgment={msg.judgment}
                              activeTab={chat.activeTab}
                              onTabChange={chat.setActiveTab}
                              doneVerificationIds={chat.doneVerificationIds}
                              onToggleVerification={chat.toggleVerificationDone}
                              highlightVerificationFor={chat.highlightVerificationFor}
                              onLayerFeedback={(signal, comment) => {
                                void submitLayerFeedback(
                                  msg.judgment!.answerId,
                                  signal,
                                  comment
                                );
                              }}
                            />
                          )}
                      </>
                    ) : null}
                  </div>
                )
              )}
            </div>

            <div className="prompt-dock prompt-dock--bottom">
              <PromptComposer {...composerProps} variant="dock" />
            </div>
          </>
        )}
      </div>

      {chat.pendingStakes && (
        <StakesConfirmation
          mode="prompt"
          promptPreview={chat.pendingStakes.promptContent}
          suggestedUsage={chat.pendingStakes.detection.suggestedUsage}
          detectionHint={chat.pendingStakes.detection.detectionHint}
          onConfirm={chat.confirmStakes}
          onCancel={chat.cancelStakes}
        />
      )}

      {chat.stakesEditOpen && chat.sessionUsage && (
        <StakesConfirmation
          mode="edit"
          suggestedUsage={chat.sessionUsage}
          onConfirm={chat.confirmStakesEdit}
          onCancel={chat.cancelStakesEdit}
        />
      )}
    </div>
  );
}
