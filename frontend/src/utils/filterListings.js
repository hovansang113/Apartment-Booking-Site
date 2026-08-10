// Loc bo sung phia client cho location/guests — category da duoc loc o server (REQ_05).
export function filterListings(listings, { location, guests }) {
  return listings.filter((listing) => {
    if (location) {
      const q = location.trim().toLowerCase();
      if (q && !listing.address.toLowerCase().includes(q)) return false;
    }

    if (guests && listing.guestCapacity < guests) return false;

    return true;
  });
}
