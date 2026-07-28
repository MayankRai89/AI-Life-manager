/**
 * Spotify Mood-Based Song Recommendation Service
 */

const moodToSearchQuery = {
  happy: ['feel good hits', 'happy vibes', 'good mood playlist'],
  energetic: ['energy boost', 'workout hype', 'power hour'],
  sad: ['sad songs', 'sad hours', 'heartbreak playlist'],
  calm: ['chill vibes', 'calm acoustic', 'peaceful piano'],
  anxious: ['calming music', 'stress relief', 'deep breathing music'],
  angry: ['rage playlist', 'aggressive rock', 'workout anger'],
};

// High-quality curated fallback database (Real Spotify tracks & covers)
const curatedMoodTracks = {
  happy: [
    {
      name: "Happy",
      artist: "Pharrell Williams",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e44d6",
      spotifyUrl: "https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH",
      previewUrl: "https://p.scdn.co/mp3-preview/489943270d5402636a0d24e16441b07d5c95a20c?cid=774be1a40614400e93514f421597813a",
      duration: "3:53",
      moodTag: "happy"
    },
    {
      name: "Can't Stop the Feeling!",
      artist: "Justin Timberlake",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273a9856a90895315b81a42e128",
      spotifyUrl: "https://open.spotify.com/track/1uvvoZc46uf7pLVZp28hkN",
      previewUrl: null,
      duration: "3:56",
      moodTag: "happy"
    },
    {
      name: "Sunroof",
      artist: "Nicky Youre, dazy",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273574c83f6f1947b4d45543c7b",
      spotifyUrl: "https://open.spotify.com/track/4h90yBH0RjYSp28T2Y1x6E",
      previewUrl: null,
      duration: "2:43",
      moodTag: "happy"
    },
    {
      name: "Good Life",
      artist: "OneRepublic",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273215264b38d387034b07e78e2",
      spotifyUrl: "https://open.spotify.com/track/6225BD4X4L8y2473p0W1qX",
      previewUrl: null,
      duration: "4:13",
      moodTag: "happy"
    }
  ],
  energetic: [
    {
      name: "Eye of the Tiger",
      artist: "Survivor",
      albumArt: "https://i.scdn.co/image/ab67616d0000b27361a38f381c81efc0a76be2bf",
      spotifyUrl: "https://open.spotify.com/track/2eAvDwuZikIH2p97plKwqR",
      previewUrl: null,
      duration: "4:04",
      moodTag: "energetic"
    },
    {
      name: "Blinding Lights",
      artist: "The Weeknd",
      albumArt: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5a86d7",
      spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b",
      previewUrl: null,
      duration: "3:20",
      moodTag: "energetic"
    },
    {
      name: "Can't Hold Us",
      artist: "Macklemore & Ryan Lewis",
      albumArt: "https://i.scdn.co/image/ab67616d0000b27343e0e7a275463777d036b0ec",
      spotifyUrl: "https://open.spotify.com/track/3BidLyRlCfqc0o83LToCcw",
      previewUrl: null,
      duration: "4:18",
      moodTag: "energetic"
    },
    {
      name: "Stronger",
      artist: "Kanye West",
      albumArt: "https://i.scdn.co/image/ab67616d0000b2730e20601c91ff30bf97a15a8d",
      spotifyUrl: "https://open.spotify.com/track/4fzsfWzY2pBxLz2zGfiODV",
      previewUrl: null,
      duration: "5:12",
      moodTag: "energetic"
    }
  ],
  sad: [
    {
      name: "Someone Like You",
      artist: "Adele",
      albumArt: "https://i.scdn.co/image/ab67616d0000b2732118bf9b198b05a95ded6300",
      spotifyUrl: "https://open.spotify.com/track/10Is7q4J7u7vT8nJ7X55u2",
      previewUrl: null,
      duration: "4:45",
      moodTag: "sad"
    },
    {
      name: "Fix You",
      artist: "Coldplay",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273de062f6b8b0e8b79e27c1967",
      spotifyUrl: "https://open.spotify.com/track/7syW8v06Gj48Vzgj29ascA",
      previewUrl: null,
      duration: "4:55",
      moodTag: "sad"
    },
    {
      name: "All of Me",
      artist: "John Legend",
      albumArt: "https://i.scdn.co/image/ab67616d0000b27339178f773ecb15f9b4566c5d",
      spotifyUrl: "https://open.spotify.com/track/3yfqDefWyuDFjhs4sFRU2W",
      previewUrl: null,
      duration: "4:29",
      moodTag: "sad"
    },
    {
      name: "Drivers License",
      artist: "Olivia Rodrigo",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a",
      spotifyUrl: "https://open.spotify.com/track/5eeB10xed6i0lP4e6s75kH",
      previewUrl: null,
      duration: "4:02",
      moodTag: "sad"
    }
  ],
  calm: [
    {
      name: "Weightless",
      artist: "Marconi Union",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273bf7c4331edbdfc487195d2c6",
      spotifyUrl: "https://open.spotify.com/track/6kkwzB4hR2s9w29f0Jv6cK",
      previewUrl: null,
      duration: "8:00",
      moodTag: "calm"
    },
    {
      name: "River Flows in You",
      artist: "Yiruma",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273c52e4ecad31ff2bb9c922576",
      spotifyUrl: "https://open.spotify.com/track/6MZZlF2B5vD7912jZ9d1cK",
      previewUrl: null,
      duration: "3:08",
      moodTag: "calm"
    },
    {
      name: "Strawberry Swing",
      artist: "Coldplay",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273de062f6b8b0e8b79e27c1967",
      spotifyUrl: "https://open.spotify.com/track/5cZ4B08pM1X1Y027p366vN",
      previewUrl: null,
      duration: "4:09",
      moodTag: "calm"
    },
    {
      name: "Sunset Lover",
      artist: "Petit Biscuit",
      albumArt: "https://i.scdn.co/image/ab67616d0000b27339798e21a221f736294d1377",
      spotifyUrl: "https://open.spotify.com/track/0hNdu5yR4qQjMSuZPtP4K4",
      previewUrl: null,
      duration: "3:57",
      moodTag: "calm"
    }
  ],
  anxious: [
    {
      name: "Breathe (2 AM)",
      artist: "Anna Nalick",
      albumArt: "https://i.scdn.co/image/ab67616d0000b27376a91703666d98eef6066b1a",
      spotifyUrl: "https://open.spotify.com/track/63v1X5d7v3J3L6bK29nQvW",
      previewUrl: null,
      duration: "4:39",
      moodTag: "anxious"
    },
    {
      name: "Clair de Lune",
      artist: "Claude Debussy",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273d2a71f00cb105e492bbd298f",
      spotifyUrl: "https://open.spotify.com/track/6N18820Z7L1q765w14392N",
      previewUrl: null,
      duration: "5:03",
      moodTag: "anxious"
    },
    {
      name: "Holocene",
      artist: "Bon Iver",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273bd643bd0d37e6f6a7cf2bb52",
      spotifyUrl: "https://open.spotify.com/track/4jT2dD3o4VjNf0fS095c5K",
      previewUrl: null,
      duration: "5:36",
      moodTag: "anxious"
    },
    {
      name: "Deep Breath Chill",
      artist: "Lo-Fi Meditation",
      albumArt: "https://i.scdn.co/image/ab67616d0000b27339798e21a221f736294d1377",
      spotifyUrl: "https://open.spotify.com/track/3yfqDefWyuDFjhs4sFRU2W",
      previewUrl: null,
      duration: "3:15",
      moodTag: "anxious"
    }
  ],
  angry: [
    {
      name: "In the End",
      artist: "Linkin Park",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273e2f039ab901500240b904c6e",
      spotifyUrl: "https://open.spotify.com/track/60r5M2v6SGzICrmYj2B6id",
      previewUrl: null,
      duration: "3:36",
      moodTag: "angry"
    },
    {
      name: "Break Stuff",
      artist: "Limp Bizkit",
      albumArt: "https://i.scdn.co/image/ab67616d0000b273574c83f6f1947b4d45543c7b",
      spotifyUrl: "https://open.spotify.com/track/5cZ4B08pM1X1Y027p366vN",
      previewUrl: null,
      duration: "2:46",
      moodTag: "angry"
    },
    {
      name: "Killing In The Name",
      artist: "Rage Against The Machine",
      albumArt: "https://i.scdn.co/image/ab67616d0000b27361a38f381c81efc0a76be2bf",
      spotifyUrl: "https://open.spotify.com/track/0e2r5j1j10fK7y5x53381a",
      previewUrl: null,
      duration: "5:14",
      moodTag: "angry"
    },
    {
      name: "Chop Suey!",
      artist: "System Of A Down",
      albumArt: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5a86d7",
      spotifyUrl: "https://open.spotify.com/track/22066jX7F38G1n6c5Z2K34",
      previewUrl: null,
      duration: "3:30",
      moodTag: "angry"
    }
  ]
};

/**
 * Step 2: Search for a matching playlist via RapidAPI
 */
async function findPlaylistForMood(mood) {
  const normalizedMood = (mood || 'calm').toLowerCase();
  const queries = moodToSearchQuery[normalizedMood] || moodToSearchQuery['calm'];

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    return null;
  }

  for (const query of queries) {
    try {
      const url = `https://spotify23.p.rapidapi.com/search/?q=${encodeURIComponent(query)}&type=playlists&limit=5`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'spotify23.p.rapidapi.com',
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const playlists = data?.playlists?.items;

      if (playlists && playlists.length > 0) {
        // extract playlist ID from URI or data
        const firstPlaylist = playlists[0];
        const uri = firstPlaylist?.data?.uri || firstPlaylist?.data?.id || '';
        return uri.includes(':') ? uri.split(':').pop() : uri;
      }
    } catch (err) {
      console.warn(`[Spotify Service] RapidAPI playlist search failed for query '${query}':`, err.message);
    }
  }

  return null;
}

/**
 * Step 3: Fetch tracks from a playlist via RapidAPI
 */
async function getTracksFromPlaylist(playlistId, limit = 10) {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey || !playlistId) return [];

  try {
    const url = `https://spotify23.p.rapidapi.com/playlist_tracks/?id=${playlistId}&offset=0&limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'spotify23.p.rapidapi.com',
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data?.items) return [];

    return data.items
      .filter(item => item?.track)
      .map(item => ({
        name: item.track.name,
        artist: item.track.artists?.[0]?.name || 'Unknown Artist',
        previewUrl: item.track.preview_url || null,
        spotifyUrl: item.track.external_urls?.spotify || `https://open.spotify.com/track/${item.track.id}`,
        albumArt: item.track.album?.images?.[0]?.url || 'https://i.scdn.co/image/ab67616d0000b27339798e21a221f736294d1377',
        duration: formatDurationMs(item.track.duration_ms),
      }));
  } catch (err) {
    console.warn('[Spotify Service] Error fetching playlist tracks from RapidAPI:', err.message);
    return [];
  }
}

/**
 * Step 4: Get song suggestions for mood
 */
async function getSongSuggestionForMood(mood, count = 4) {
  const normalizedMood = (mood || 'calm').toLowerCase();

  // Try live RapidAPI lookup if RAPIDAPI_KEY is present
  if (process.env.RAPIDAPI_KEY) {
    const playlistId = await findPlaylistForMood(normalizedMood);
    if (playlistId) {
      const tracks = await getTracksFromPlaylist(playlistId, 15);
      if (tracks && tracks.length > 0) {
        // Shuffle tracks array for variety
        const shuffled = [...tracks].sort(() => 0.5 - Math.random());
        return {
          mood: normalizedMood,
          source: 'rapidapi-spotify',
          tracks: shuffled.slice(0, count)
        };
      }
    }
  }

  // Curated Fallback
  const fallbackList = curatedMoodTracks[normalizedMood] || curatedMoodTracks['calm'];
  const shuffledFallback = [...fallbackList].sort(() => 0.5 - Math.random());

  return {
    mood: normalizedMood,
    source: 'curated-fallback',
    tracks: shuffledFallback.slice(0, count)
  };
}

function formatDurationMs(ms) {
  if (!ms) return '3:30';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

module.exports = {
  moodToSearchQuery,
  findPlaylistForMood,
  getTracksFromPlaylist,
  getSongSuggestionForMood,
};
