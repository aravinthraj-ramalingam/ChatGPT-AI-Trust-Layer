/** Fixture: decision + high stakes — should yield judgment items */
export const euMarketFixture = {
  prompt:
    "Should we enter the EU market in 2026 given our current regulatory timeline and budget?",
  answer: `
Entering the EU market in 2026 is viable if regulatory clearance completes on schedule before Q2 launch.
Revenue projections assume stable FX rates and unchanged tariff policy through 2026.
However, EU MDR approval timelines have slipped for similar device classes in the past year, which could delay launch.
There is regulatory risk if compliance requirements change before filing.
Trade policy shifts on tariffs may require repricing if announced in 2026.
Teams should validate demand in the target segment against the latest market study before committing headcount.
`.trim(),
};

export const chitchatFixture = {
  prompt: "Hello!",
  answer: "Hi there! How can I help you today with your work or research?",
};

export const shortAnswerFixture = {
  prompt: "Should we invest in segment A?",
  answer: "Yes, proceed.",
};
