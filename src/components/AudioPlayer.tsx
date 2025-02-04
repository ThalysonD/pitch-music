import React, { useEffect, useRef, useState } from 'react';
import { Trash2, ChevronUp, ChevronDown, Play, Pause } from 'lucide-react';
import { AudioPlayerProps } from '../types';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function AudioPlayer({ song, onDelete, onUpdateKey }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [currentKey, setCurrentKey] = useState(song.key);
  const audioRef = useRef<HTMLAudioElement>(null);

  const calculateKeyFromPitch = (baseKey: string, pitchChange: number) => {
    const baseKeyIndex = NOTES.indexOf(baseKey);
    let newKeyIndex = (baseKeyIndex + pitchChange) % 12;
    if (newKeyIndex < 0) newKeyIndex += 12;
    return NOTES[newKeyIndex];
  };

  const handlePitchChange = (semitones: number) => {
    const newPitch = Math.max(-12, Math.min(12, pitch + semitones));
    setPitch(newPitch);
    
    if (audioRef.current) {
      audioRef.current.preservesPitch = false;
      audioRef.current.playbackRate = Math.pow(2, newPitch / 12);
    }

    // Update the current key based on the original key and pitch
    const newKey = calculateKeyFromPitch(song.key, newPitch);
    setCurrentKey(newKey);
  };

  const handleKeyChange = (newKey: string) => {
    onUpdateKey(song.id, newKey);
    // Reset pitch when changing the original key
    setPitch(0);
    setCurrentKey(newKey);
    if (audioRef.current) {
      audioRef.current.playbackRate = 1;
    }
  };

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  useEffect(() => {
    // Reset audio state when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Update isPlaying state when audio ends
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio?.addEventListener('ended', handleEnded);
    
    return () => {
      audio?.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{song.name}</h3>
          <div className="flex items-center gap-2">
            <p className="text-gray-400">Original Key:</p>
            <select
              value={song.key}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="bg-gray-700 text-white rounded px-2 py-1"
            >
              {NOTES.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <p className="text-gray-400 ml-4">Current Key: {currentKey}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(song.id)}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={togglePlay}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePitchChange(-1)}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2"
          >
            <ChevronDown size={20} />
          </button>
          <span className="text-white min-w-[3ch] text-center">{pitch}</span>
          <button
            onClick={() => handlePitchChange(1)}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2"
          >
            <ChevronUp size={20} />
          </button>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={song.url} 
        controls 
        className="w-full h-8 [&::-webkit-media-controls-panel]:bg-gray-700 [&::-webkit-media-controls-current-time-display]:text-white [&::-webkit-media-controls-time-remaining-display]:text-white"
      />
    </div>
  );
}