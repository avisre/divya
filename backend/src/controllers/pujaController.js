import { Puja } from "../models/Puja.js";

function selectPricing(pricing, currency = "USD") {
  const key = currency.toLowerCase();
  return pricing?.[key] ?? pricing?.usd ?? 0;
}

export async function getPujas(req, res, next) {
  try {
    const currency = (req.query.currency || "USD").toUpperCase();
    const pujas = await Puja.find({ isActive: true }).populate("deity temple").sort({ order: 1 });
    return res.json(
      pujas.map((puja) => ({
        ...puja.toObject(),
        displayPrice: { amount: selectPricing(puja.pricing, currency), currency }
      }))
    );
  } catch (error) {
    next(error);
  }
}

export async function getPujaById(req, res, next) {
  try {
    const currency = (req.query.currency || "USD").toUpperCase();
    const puja = await Puja.findById(req.params.id).populate("deity temple");
    if (!puja) {
      return res.status(404).json({ message: "Puja not found" });
    }
    return res.json({
      ...puja.toObject(),
      displayPrice: { amount: selectPricing(puja.pricing, currency), currency }
    });
  } catch (error) {
    next(error);
  }
}
