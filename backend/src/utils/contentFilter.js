import Filter from "bad-words";

const filter = new Filter();

export function filterIntention(text) {
  if (!text || text.length < 10) {
    throw new Error("Intention too short (minimum 10 characters)");
  }
  if (text.length > 500) {
    throw new Error("Intention too long (maximum 500 characters)");
  }
  if (filter.isProfane(text)) {
    return { clean: false, filtered: filter.clean(text), requiresReview: true };
  }
  return { clean: true, filtered: text, requiresReview: false };
}

