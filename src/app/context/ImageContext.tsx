import { createContext, useContext, useState, ReactNode } from 'react';

export interface ImageSlot {
  id: string;
  image: string;
  name: string;
  order: number;
}

interface ImageContextType {
  imageSlots: ImageSlot[];
  addImageSlot: (image: string, name: string) => void;
  removeImageSlot: (id: string) => void;
  updateImageSlot: (id: string, image: string) => void;
  reorderImageSlots: (slots: ImageSlot[]) => void;
  clearAllSlots: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([]);

  const addImageSlot = (image: string, name: string) => {
    const newSlot: ImageSlot = {
      id: `slot-${Date.now()}-${Math.random()}`,
      image,
      name,
      order: imageSlots.length,
    };
    setImageSlots((prev) => [...prev, newSlot]);
  };

  const removeImageSlot = (id: string) => {
    setImageSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const updateImageSlot = (id: string, image: string) => {
    setImageSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, image } : slot))
    );
  };

  const reorderImageSlots = (slots: ImageSlot[]) => {
    setImageSlots(slots);
  };

  const clearAllSlots = () => {
    setImageSlots([]);
  };

  return (
    <ImageContext.Provider
      value={{
        imageSlots,
        addImageSlot,
        removeImageSlot,
        updateImageSlot,
        reorderImageSlots,
        clearAllSlots,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
}

export function useImage() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
}