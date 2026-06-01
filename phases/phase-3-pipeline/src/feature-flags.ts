/**
 * Feature flag + kill switch — Architecture §10 cross-cutting.
 * `TRUST_THROUGH_JUDGMENT_ENABLED` env mirrors product flag name.
 */

export interface FeatureFlags {
  /** Product feature flag: trust_through_judgment_enabled */
  trustThroughJudgmentEnabled: boolean;
  /** Global kill switch: hide all judgment UI and skip pipeline */
  judgmentKillSwitch: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  trustThroughJudgmentEnabled: true,
  judgmentKillSwitch: false,
};

export function resolveFeatureFlags(
  overrides?: Partial<FeatureFlags>
): FeatureFlags {
  const fromEnv = readEnvFlags();
  return {
    ...DEFAULT_FLAGS,
    ...fromEnv,
    ...overrides,
  };
}

function readEnvFlags(): Partial<FeatureFlags> {
  const env =
    typeof process !== "undefined" && process.env ? process.env : undefined;
  if (!env) return {};

  const enabled = env.TRUST_THROUGH_JUDGMENT_ENABLED;
  const kill = env.JUDGMENT_KILL_SWITCH;
  const partial: Partial<FeatureFlags> = {};
  if (enabled !== undefined) {
    partial.trustThroughJudgmentEnabled = enabled === "true" || enabled === "1";
  }
  if (kill !== undefined) {
    partial.judgmentKillSwitch = kill === "true" || kill === "1";
  }
  return partial;
}

/** Judgment pipeline runs only when feature is on and kill switch is off */
export function isJudgmentActive(flags: FeatureFlags): boolean {
  return flags.trustThroughJudgmentEnabled && !flags.judgmentKillSwitch;
}

/** UI should hide judgment chip/panels when inactive */
export function shouldShowJudgmentUI(
  flags: FeatureFlags,
  summaryShowChip: boolean
): boolean {
  return isJudgmentActive(flags) && summaryShowChip;
}
