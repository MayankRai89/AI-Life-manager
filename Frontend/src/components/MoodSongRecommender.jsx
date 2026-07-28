import React, { useState, useEffect } from 'react';
import api from '../api';
import './MoodSongRecommender.css';

const MOOD_OPTIONS = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#ffb703', query: 'feel good hits' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', color: '#ff5400', query: 'energy boost' },
  { id: 'sad', label: 'Sad', emoji: '😔', color: '#4a4e69', query: 'sad songs' },
  { id: 'calm', label: 'Calm', emoji: '🧘', color: '#06d6a0', query: 'chill vibes' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#9d4edd', query: 'calming music' },
  { id: 'angry', label: 'Angry', emoji: '🤬', color: '#e63946', query: 'rage playlist' },
];

export default function MoodSongRecommender({ currentMood }) {
  const [selectedMood, setSelectedMood] = useState(currentMood || 'happy');
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playingPreview, setPlayingPreview] = useState(null);
  const [audioObj, setAudioObj] = useState(null);
  const [activeEmbedTrack, setActiveEmbedTrack] = useState(null);

  // Sync with prop changes if currentMood changes
  useEffect(() => {
    if (currentMood && MOOD_OPTIONS.some(m => m.id === currentMood.toLowerCase())) {
      setSelectedMood(currentMood.toLowerCase());
    }
  }, [currentMood]);

  // Fetch song recommendations when selectedMood changes
  useEffect(() => {
    fetchRecommendations(selectedMood);
  }, [selectedMood]);

  const fetchRecommendations = async (mood) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/spotify/recommendations?mood=${mood}&count=4`);
      if (res.data && res.data.tracks) {
        setTracks(res.data.tracks);
      } else {
        setTracks([]);
      }
    } catch (err) {
      console.error('Error fetching mood song recommendations:', err);
      setError('Could not load song suggestions right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreview = (track) => {
    if (!track.previewUrl) {
      // If no preview URL, open Spotify URL in embed player or new tab
      setActiveEmbedTrack(track);
      return;
    }

    if (playingPreview === track.spotifyUrl || playingPreview === track.name) {
      if (audioObj) {
        audioObj.pause();
      }
      setPlayingPreview(null);
      setAudioObj(null);
    } else {
      if (audioObj) {
        audioObj.pause();
      }
      const newAudio = new Audio(track.previewUrl);
      newAudio.play().catch(err => console.log('Audio playback error:', err));
      newAudio.onended = () => {
        setPlayingPreview(null);
        setAudioObj(null);
      };
      setAudioObj(newAudio);
      setPlayingPreview(track.spotifyUrl || track.name);
    }
  };

  const activeMoodObj = MOOD_OPTIONS.find(m => m.id === selectedMood) || MOOD_OPTIONS[0];

  return (
    <div className="mood-music-container glass-card">
      <div className="mood-music-header">
        <div className="title-area">
          <span className="music-icon-badge">🎵</span>
          <div>
            <h3>Mood Music Recommender</h3>
            <p className="subtitle">Curated Spotify songs to match how you feel</p>
          </div>
        </div>

        <button 
          className="shuffle-btn" 
          onClick={() => fetchRecommendations(selectedMood)}
          disabled={loading}
          title="Shuffle songs for this mood"
        >
          🔄 Shuffle
        </button>
      </div>

      {/* Mood Selector Pills */}
      <div className="mood-pills-row">
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m.id}
            className={`mood-pill ${selectedMood === m.id ? 'active' : ''}`}
            onClick={() => setSelectedMood(m.id)}
            style={{
              '--mood-color': m.color,
            }}
          >
            <span className="mood-emoji">{m.emoji}</span>
            <span className="mood-label">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Track Cards Grid */}
      {loading ? (
        <div className="music-loading-state">
          <div className="spinner"></div>
          <p>Searching Spotify playlists for <strong>{activeMoodObj.label}</strong> vibes...</p>
        </div>
      ) : error ? (
        <div className="music-error-state">
          <p>{error}</p>
          <button onClick={() => fetchRecommendations(selectedMood)}>Try Again</button>
        </div>
      ) : (
        <div className="tracks-grid">
          {tracks.map((track, idx) => {
            const isPlaying = playingPreview === (track.spotifyUrl || track.name);
            return (
              <div key={idx} className="track-card">
                <div className="album-art-wrapper">
                  <img 
                    src={track.albumArt || 'https://i.scdn.co/image/ab67616d0000b27339798e21a221f736294d1377'} 
                    alt={track.name} 
                    className="album-art"
                  />
                  <button 
                    className={`play-overlay-btn ${isPlaying ? 'playing' : ''}`}
                    onClick={() => handleTogglePreview(track)}
                    title={track.previewUrl ? (isPlaying ? "Pause Preview" : "Play 30s Preview") : "Open Track"}
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  {isPlaying && (
                    <div className="equalizer-bars">
                      <span></span><span></span><span></span>
                    </div>
                  )}
                </div>

                <div className="track-info">
                  <h4 className="track-name" title={track.name}>{track.name}</h4>
                  <p className="track-artist" title={track.artist}>{track.artist}</p>
                  
                  <div className="track-meta">
                    <span className="track-duration">⏱ {track.duration || '3:30'}</span>
                    <a 
                      href={track.spotifyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="spotify-link-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.376 0 0 5.377 0 12s5.376 12 12 12 12-5.377 12-12S18.624 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.899 4.62-1.02 8.52-.6 11.64 1.32.42.18.479.659.301 1.019zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Spotify
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Embedded Spotify Player Modal */}
      {activeEmbedTrack && (
        <div className="spotify-modal-backdrop" onClick={() => setActiveEmbedTrack(null)}>
          <div className="spotify-modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Playing on Spotify</h4>
              <button className="close-btn" onClick={() => setActiveEmbedTrack(null)}>✕</button>
            </div>
            <iframe
              src={`https://open.spotify.com/embed/track/${activeEmbedTrack.spotifyUrl ? activeEmbedTrack.spotifyUrl.split('/').pop() : ''}?utm_source=generator`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify Player"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
