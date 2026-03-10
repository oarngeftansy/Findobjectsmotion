import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ImageProvider } from './context/ImageContext';

export default function App() {
  return (
    <ImageProvider>
      <RouterProvider router={router} />
    </ImageProvider>
  );
}