import { distanceKm, formatDistance, mapsUrl, regionFor, sortByDistance } from '../geo'

const paris = { latitude: 48.8566, longitude: 2.3522 }
const lyon = { latitude: 45.764, longitude: 4.8357 }

describe('geo', () => {
  it('englobe les points ou se centre sur le repli', () => {
    expect(regionFor([], paris, 0.1)).toEqual({ ...paris, latitudeDelta: 0.1, longitudeDelta: 0.1 })
    const region = regionFor([paris, lyon], paris)
    expect(region.latitude).toBeCloseTo((paris.latitude + lyon.latitude) / 2)
    expect(region.latitudeDelta).toBeCloseTo((paris.latitude - lyon.latitude) * 1.4)
    expect(regionFor([paris], lyon, 0.05)).toMatchObject({ ...paris, latitudeDelta: 0.05 })
  })

  it('mesure et trie par distance', () => {
    expect(distanceKm(paris, lyon)).toBeGreaterThan(390)
    expect(distanceKm(paris, lyon)).toBeLessThan(395)
    expect(sortByDistance([lyon, paris], paris)).toEqual([paris, lyon])
    expect(formatDistance(0.8523, 'en-US')).toBe('850 m')
    expect(formatDistance(3.24, 'en-US')).toBe('3.2 km')
    expect(formatDistance(392.4, 'en-US')).toBe('392 km')
  })

  it('construit le lien de l app de cartes', () => {
    expect(mapsUrl(paris, 'Tour Eiffel', 'ios')).toBe('https://maps.apple.com/?ll=48.8566,2.3522&q=Tour%20Eiffel')
    expect(mapsUrl(paris, undefined, 'android')).toBe('geo:48.8566,2.3522?q=48.8566,2.3522(48.8566%2C2.3522)')
    expect(mapsUrl(paris, 'x', 'web')).toContain('query=48.8566,2.3522')
  })
})
