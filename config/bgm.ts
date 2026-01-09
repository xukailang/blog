export interface BGMTrack {
  id: string
  title: string
  artist: string
  src: string
  cover?: string
}

export interface BGMConfig {
  routes: {
    pattern: string | RegExp
    tracks: BGMTrack[]
  }[]
  defaultTracks: BGMTrack[]
  settings: {
    defaultMuted: boolean
    defaultVolume: number
    crossfadeDuration: number
  }
}

export const bgmConfig: BGMConfig = {
  routes: [
    {
      pattern: '/',
      tracks: [
        {
          id: 'home-1',
          title: 'Cyberpunk Metaverse',
          artist: 'Unknown',
          src: '/audio/cyberpunk-metaverse-event-background-music-391980.mp3',
        },
        {
          id: 'home-2',
          title: 'Synthwave',
          artist: 'Unknown',
          src: '/audio/synthwave-146901.mp3',
        },
      ],
    },
    {
      pattern: /^\/blog$/,
      tracks: [
        {
          id: 'blog-1',
          title: "80's Night Synthwave",
          artist: 'Unknown',
          src: '/audio/80x27s-night-synthwave-308132.mp3',
        },
        {
          id: 'blog-2',
          title: 'Stylish Retrowave',
          artist: 'Unknown',
          src: '/audio/stylish-retrowave-synthwave-background-274274.mp3',
        },
      ],
    },
    {
      pattern: /^\/blog\/.+/,
      tracks: [
        {
          id: 'post-1',
          title: 'Lo-Fi Background',
          artist: 'Unknown',
          src: '/audio/lo-fi-background-music-455021.mp3',
        },
        {
          id: 'post-2',
          title: 'Lo-Fi Sunset',
          artist: 'Unknown',
          src: '/audio/lo-fi-sunset-378814.mp3',
        },
      ],
    },
    {
      pattern: '/about',
      tracks: [
        {
          id: 'about-1',
          title: 'Chill Music',
          artist: 'Unknown',
          src: '/audio/chill-music-461488.mp3',
        },
      ],
    },
    {
      pattern: '/gallery',
      tracks: [
        {
          id: 'gallery-1',
          title: 'Stylish Retrowave',
          artist: 'Unknown',
          src: '/audio/stylish-retrowave-synthwave-background-274274.mp3',
        },
      ],
    },
    {
      pattern: /^\/vlogs/,
      tracks: [
        {
          id: 'vlog-1',
          title: 'Synthwave',
          artist: 'Unknown',
          src: '/audio/synthwave-146901.mp3',
        },
      ],
    },
  ],
  defaultTracks: [
    {
      id: 'default-1',
      title: 'Cyberpunk Metaverse',
      artist: 'Unknown',
      src: '/audio/cyberpunk-metaverse-event-background-music-391980.mp3',
    },
  ],
  settings: {
    defaultMuted: true,
    defaultVolume: 0.5,
    crossfadeDuration: 1000,
  },
}

export function getTracksForPath(pathname: string): BGMTrack[] {
  for (const route of bgmConfig.routes) {
    if (typeof route.pattern === 'string') {
      if (pathname === route.pattern) {
        return route.tracks
      }
    } else if (route.pattern instanceof RegExp) {
      if (route.pattern.test(pathname)) {
        return route.tracks
      }
    }
  }
  return bgmConfig.defaultTracks
}
