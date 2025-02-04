import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { AudioPlayer } from './components/AudioPlayer';
import { Song } from './types';

function App() {
  const [songs, setSongs] = useState<Song[]>([]);

  // Load songs from localStorage on initial render
  useEffect(() => {
    const savedSongs = localStorage.getItem('musicPitchSongs');
    if (savedSongs) {
      const parsedSongs = JSON.parse(savedSongs);
      // Recreate File objects and URLs for saved songs
      const restoredSongs = parsedSongs.map((song: any) => ({
        ...song,
        file: new File([new Blob()], song.name), // Placeholder file object
        url: song.url
      }));
      setSongs(restoredSongs);
    }
  }, []);

  // Save songs to localStorage whenever they change
  useEffect(() => {
    // Store only necessary data (exclude File object)
    const songsToStore = songs.map(song => ({
      id: song.id,
      name: song.name,
      key: song.key,
      url: song.url
    }));
    localStorage.setItem('musicPitchSongs', JSON.stringify(songsToStore));
  }, [songs]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && songs.length < 8) {
      const newSongs = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        key: 'C',
        file,
        url: URL.createObjectURL(file)
      }));
      setSongs([...songs, ...newSongs].slice(0, 8));
    }
  };

  const handleDelete = (id: string) => {
    setSongs(prevSongs => {
      const songToDelete = prevSongs.find(song => song.id === id);
      if (songToDelete) {
        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(songToDelete.url);
      }
      return prevSongs.filter(song => song.id !== id);
    });
  };

  const handleUpdateKey = (id: string, newKey: string) => {
    setSongs(songs.map(song => 
      song.id === id ? { ...song, key: newKey } : song
    ));
  };

  const handleClearAll = () => {
    // Revoke all URLs before clearing
    songs.forEach(song => {
      URL.revokeObjectURL(song.url);
    });
    setSongs([]);
    localStorage.removeItem('musicPitchSongs');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Music size={32} />
            Music Pitch Controller
          </h1>
          
          <div className="flex gap-4">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer">
              Upload Music
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={songs.length >= 8}
              />
            </label>
            {songs.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {songs.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No songs uploaded yet. Upload up to 8 songs to begin.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {songs.map(song => (
              <AudioPlayer
                key={song.id}
                song={song}
                onDelete={handleDelete}
                onUpdateKey={handleUpdateKey}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;