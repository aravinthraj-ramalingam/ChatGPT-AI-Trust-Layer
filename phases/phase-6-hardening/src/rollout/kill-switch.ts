import {
  isJudgmentActive,
  shouldShowJudgmentUI,
  type FeatureFlags,
} from "@ttj/phase-3-pipeline";
import type { DrillCheck, KillSwitchDrillResult } from "./types.js";

/**
 * Execute a kill switch drill.
 * Simulates activating the kill switch and verifies all judgment is suppressed.
 * Architecture §10: kill switch hides all judgment UI globally.
 */
export function executeKillSwitchDrill(): KillSwitchDrillResult {
  const checks: DrillCheck[] = [];

  // 1. Verify kill switch flag suppresses judgment pipeline
  const killSwitchFlags: FeatureFlags = {
    trustThroughJudgmentEnabled: true,
    judgmentKillSwitch: true,
  };

  const judgmentActive = isJudgmentActive(killSwitchFlags);
  checks.push({
    name: "pipeline_suppressed",
    description: "Judgment pipeline should not run when kill switch is active",
    passed: !judgmentActive,
    detail: `isJudgmentActive returned ${judgmentActive}`,
  });

  // 2. Verify UI is hidden when kill switch is active
  const uiShown = shouldShowJudgmentUI(killSwitchFlags, true);
  checks.push({
    name: "ui_hidden",
    description: "Judgment UI should be hidden when kill switch is active",
    passed: !uiShown,
    detail: `shouldShowJudgmentUI(chip=true) returned ${uiShown}`,
  });

  // 3. Verify kill switch overrides feature flag being on
  const bothOnFlags: FeatureFlags = {
    trustThroughJudgmentEnabled: true,
    judgmentKillSwitch: true,
  };
  const activeWithBothOn = isJudgmentActive(bothOnFlags);
  checks.push({
    name: "kill_switch_overrides_feature",
    description: "Kill switch should override feature flag even when feature is enabled",
    passed: !activeWithBothOn,
    detail: `Kill switch + feature on → isJudgmentActive=${activeWithBothOn}`,
  });

  // 4. Verify feature flag off also suppresses
  const featureOffFlags: FeatureFlags = {
    trustThroughJudgmentEnabled: false,
    judgmentKillSwitch: false,
  };
  const activeWithFeatureOff = isJudgmentActive(featureOffFlags);
  checks.push({
    name: "feature_flag_off_suppresses",
    description: "Feature flag off should suppress judgment regardless of kill switch",
    passed: !activeWithFeatureOff,
    detail: `Feature off → isJudgmentActive=${activeWithFeatureOff}`,
  });

  // 5. Verify normal operation when both flags are healthy
  const normalFlags: FeatureFlags = {
    trustThroughJudgmentEnabled: true,
    judgmentKillSwitch: false,
  };
  const activeNormally = isJudgmentActive(normalFlags);
  checks.push({
    name: "normal_operation",
    description: "Judgment should be active when feature is on and kill switch is off",
    passed: activeNormally,
    detail: `Normal flags → isJudgmentActive=${activeNormally}`,
  });

  // 6. Verify UI shows normally when chip should show
  const uiShownNormally = shouldShowJudgmentUI(normalFlags, true);
  checks.push({
    name: "normal_ui_shown",
    description: "UI should show when flags are healthy and chip should show",
    passed: uiShownNormally,
    detail: `Normal flags + chip=true → shouldShowJudgmentUI=${uiShownNormally}`,
  });

  const checksPassed = checks.filter((c) => c.passed).length;
  const checksFailed = checks.filter((c) => !c.passed).length;

  return {
    executedAt: new Date(),
    killSwitchActivated: true,
    judgmentSuppressed: !judgmentActive,
    pipelineSkipped: !judgmentActive,
    uiHidden: !uiShown,
    checksPassed,
    checksFailed,
    checks,
    passed: checksFailed === 0,
  };
}
