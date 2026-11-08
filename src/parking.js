// Pure domain logic: no browser, renderer or physics dependencies.
export const PARKING = { halfWidth: 3.1, halfLength: 4.1, maxSpeed: 0.55, dwell: 0.8, exitMargin: 1.2 };

export function insideBay(pose, bay, margin = 0) {
  const dx = pose.x - bay.position.x;
  const dz = pose.z - bay.position.z;
  const c = Math.cos(bay.heading), s = Math.sin(bay.heading);
  const x = dx * c - dz * s;
  const z = dx * s + dz * c;
  return Math.abs(x) <= PARKING.halfWidth + margin && Math.abs(z) <= PARKING.halfLength + margin;
}

export function createParkingController(bays) {
  let candidate = null, elapsed = 0, latched = null;
  return {
    update(pose, speed, dt) {
      if (!Number.isFinite(speed) || !Number.isFinite(pose.x) || !Number.isFinite(pose.z) || !Number.isFinite(dt) || dt < 0) {
        candidate = null; elapsed = 0;
        return { bay: null, progress: 0, opened: null };
      }
      if (latched && !insideBay(pose, latched, PARKING.exitMargin)) latched = null;
      const bay = bays.find(b => insideBay(pose, b)) ?? null;
      if (!bay || Math.abs(speed) > PARKING.maxSpeed || latched?.id === bay.id) {
        candidate = null; elapsed = 0;
        return { bay, progress: 0, opened: null };
      }
      if (candidate?.id !== bay.id) { candidate = bay; elapsed = 0; }
      elapsed += Math.min(dt, 0.1);
      const progress = Math.min(elapsed / PARKING.dwell, 1);
      if (progress < 1) return { bay, progress, opened: null };
      latched = bay; elapsed = 0;
      return { bay, progress: 1, opened: bay };
    },
    reset() { candidate = null; elapsed = 0; latched = null; },
  };
}
