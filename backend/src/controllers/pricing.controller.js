const pricingService = require('../services/pricing.service');
const { ok } = require('../utils/response.util');

async function setPriceOverrides(req, res) {
  const { overrides } = req.body;
  const result = await pricingService.setPriceOverrides({
    listingId: req.params.listingId,
    hostId: req.user.id,
    overrides,
  });
  return ok(res, result, 'Price overrides saved successfully');
}

async function deletePriceOverride(req, res) {
  const { date } = req.body;
  const result = await pricingService.deletePriceOverride({
    listingId: req.params.listingId,
    hostId: req.user.id,
    date,
  });
  return ok(res, result, 'Price override deleted');
}

async function getPriceOverrides(req, res) {
  const { year, month } = req.query;
  const result = await pricingService.getPriceOverrides({
    listingId: req.params.listingId,
    hostId: req.user.id,
    year,
    month,
  });
  return ok(res, result);
}

async function getPublicPriceOverrides(req, res) {
  const { year, month } = req.query;
  const result = await pricingService.getPublicPriceOverrides({
    listingId: req.params.listingId,
    year,
    month,
  });
  return ok(res, result);
}

module.exports = { setPriceOverrides, deletePriceOverride, getPriceOverrides, getPublicPriceOverrides };
