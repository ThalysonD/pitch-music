export interface Song {
  id: string;
  name: string;
  key: string;
  file: File;
  url: string;
}

export interface AudioPlayerProps {
  song: Song;
  onDelete: (id: string) => void;
  onUpdateKey: (id: string, newKey: string) => void;
}