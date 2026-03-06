const UNKNOWN_GOTHRAM = "Unknown";

const surnameRules = [
  { pattern: /\b(nair|menon|pillai|kurup)\b/i, gothram: "Kashyap", confidence: "low" },
  { pattern: /\b(iyer|iyengar|sharma|dikshit|chaturvedi)\b/i, gothram: "Bharadwaj", confidence: "low" },
  { pattern: /\b(reddy|rao|murthy)\b/i, gothram: "Vasishta", confidence: "low" },
  { pattern: /\b(gupta|aggarwal|agarwal)\b/i, gothram: "Garg", confidence: "low" },
  { pattern: /\b(patel|mehta|shah)\b/i, gothram: "Kashyap", confidence: "low" },
  { pattern: /\b(acharya|upadhyay)\b/i, gothram: "Atri", confidence: "low" }
];

const regionRules = [
  { pattern: /\b(kerala|malabar|travancore|kochi|kollam|palakkad)\b/i, gothram: "Kashyap" },
  { pattern: /\b(tamil nadu|tamil|chennai|coimbatore|madurai)\b/i, gothram: "Bharadwaj" },
  { pattern: /\b(andhra|telangana|hyderabad|vijayawada)\b/i, gothram: "Vasishta" },
  { pattern: /\b(gujarat|ahmedabad|surat|vadodara)\b/i, gothram: "Garg" },
  { pattern: /\b(karnataka|bengaluru|mysuru)\b/i, gothram: "Atri" }
];

const unknownValues = new Set([
  "",
  "unknown",
  "dont know",
  "don't know",
  "not sure",
  "na",
  "n/a",
  "none",
  "temple decide"
]);

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function toDisplayGothram(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
}

function withGuidance(result) {
  if (result.source === "family_provided") {
    return {
      ...result,
      guidanceText: "Using the gothram provided by family input. This is treated as highest-confidence input."
    };
  }
  if (result.source === "surname_rule") {
    return {
      ...result,
      guidanceText: "Suggested from surname/community pattern. Please confirm with a family elder when possible."
    };
  }
  if (result.source === "region_rule") {
    return {
      ...result,
      guidanceText: "Suggested from family region context. This is best-effort and should be confirmed."
    };
  }
  return {
    ...result,
    guidanceText: "No reliable match found. Use Unknown for now and update later if family confirms."
  };
}

export function suggestGothramFromName(devoteeName, guidanceInput = {}) {
  const name = String(devoteeName || "").trim();
  const knownFamily = normalize(guidanceInput.knownFamilyGothram);
  if (!unknownValues.has(knownFamily) && knownFamily.length > 0) {
    return withGuidance({
      gothram: toDisplayGothram(guidanceInput.knownFamilyGothram),
      confidence: "high",
      source: "family_provided"
    });
  }

  if (!name) {
    return withGuidance({
      gothram: UNKNOWN_GOTHRAM,
      confidence: "none",
      source: "missing_name"
    });
  }

  const surnameContext = [name, guidanceInput.surnameCommunity].filter(Boolean).join(" ");
  for (const rule of surnameRules) {
    if (rule.pattern.test(surnameContext)) {
      return withGuidance({
        gothram: rule.gothram,
        confidence: rule.confidence,
        source: "surname_rule"
      });
    }
  }

  const regionContext = String(guidanceInput.familyRegion || "").trim();
  for (const rule of regionRules) {
    if (rule.pattern.test(regionContext)) {
      return withGuidance({
        gothram: rule.gothram,
        confidence: "low",
        source: "region_rule"
      });
    }
  }

  for (const rule of surnameRules) {
    if (rule.pattern.test(name)) {
      return withGuidance({
        gothram: rule.gothram,
        confidence: rule.confidence,
        source: "surname_rule"
      });
    }
  }

  return withGuidance({
    gothram: UNKNOWN_GOTHRAM,
    confidence: "none",
    source: "no_match"
  });
}

export function suggestGothramGuided(input = {}) {
  return suggestGothramFromName(input.devoteeName, input);
}

export function resolveBookingGothram(inputGothram, devoteeName) {
  const normalized = normalize(inputGothram);
  if (!unknownValues.has(normalized) && normalized.length > 0) {
    return {
      gothram: String(inputGothram).trim(),
      confidence: "user_provided",
      source: "user_input"
    };
  }

  const suggestion = suggestGothramFromName(devoteeName);
  return suggestion.gothram === UNKNOWN_GOTHRAM
    ? {
        gothram: UNKNOWN_GOTHRAM,
        confidence: suggestion.confidence,
        source: suggestion.source
      }
    : suggestion;
}

export { UNKNOWN_GOTHRAM };
