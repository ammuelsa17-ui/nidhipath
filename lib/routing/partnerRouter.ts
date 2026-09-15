import { ChannelPartner, PartnerMatchResult } from '../../types';
import { DEMO_PARTNERS } from '../../data/partners';

/**
 * CHANNEL PARTNER ROUTER
 * Uses Haversine distance formula & transparent pin/scheme matching.
 * NO live NPA/availability claims made (strictly labeled as prototype demo dataset).
 */

// Approximate PIN code prefix to Lat/Long dictionary for Indian demo regions
const PIN_COORDINATES: Record<string, { lat: number; lng: number; city: string; state: string }> = {
  '560': { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', state: 'Karnataka' },
  '110': { lat: 28.6139, lng: 77.2090, city: 'New Delhi', state: 'Delhi' },
  '800': { lat: 25.5941, lng: 85.1376, city: 'Patna', state: 'Bihar' },
  '400': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
  '600': { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu' },
  '500': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana' },
  '580': { lat: 15.4589, lng: 75.0078, city: 'Dharwad', state: 'Karnataka' },
  '562': { lat: 12.6340, lng: 77.4260, city: 'Ramanagara', state: 'Karnataka' }
};

/**
 * Haversine formula to calculate great-circle distance between two points in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

/**
 * Infers coordinates from PIN code prefix
 */
export function getCoordinatesFromPin(pinCode: string): { lat: number; lng: number; city: string; state: string } {
  const prefix = pinCode.slice(0, 3);
  if (PIN_COORDINATES[prefix]) {
    return PIN_COORDINATES[prefix];
  }
  // Default to Bengaluru center if PIN not in dictionary
  return { lat: 12.9716, lng: 77.5946, city: 'Bengaluru (Default)', state: 'Karnataka' };
}

/**
 * Finds and ranks nearby compatible channel partners for a scheme
 */
export function findNearbyPartners(
  pinCode: string,
  selectedSchemeId?: string,
  partners: ChannelPartner[] = DEMO_PARTNERS
): PartnerMatchResult[] {
  const userLoc = getCoordinatesFromPin(pinCode);

  const matched = partners.map(partner => {
    const distanceKm = calculateHaversineDistance(
      userLoc.lat,
      userLoc.lng,
      partner.latitude,
      partner.longitude
    );

    const supportsSelectedScheme = selectedSchemeId
      ? partner.supportedSchemeIds.includes(selectedSchemeId)
      : true;

    // Calculate match score (combination of distance & scheme support)
    let score = Math.max(0, 100 - Math.round(distanceKm * 2));
    if (supportsSelectedScheme) {
      score += 20;
    } else {
      score = Math.max(0, score - 30);
    }

    let matchingReason = supportsSelectedScheme
      ? `✓ Designated Nodal Branch supporting selected scheme within ${distanceKm} km`
      : `Nearby partner (${distanceKm} km) — general MSME credit support`;

    if (partner.pinCode === pinCode) {
      matchingReason += ' (Exact PIN Code Match)';
    }

    return {
      partner,
      distanceKm,
      supportsSelectedScheme,
      matchScore: score,
      matchingReason
    };
  });

  // Sort by scheme support first, then distance
  return matched.sort((a, b) => {
    if (a.supportsSelectedScheme && !b.supportsSelectedScheme) return -1;
    if (!a.supportsSelectedScheme && b.supportsSelectedScheme) return 1;
    return a.distanceKm - b.distanceKm;
  });
}
