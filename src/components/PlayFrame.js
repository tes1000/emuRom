import { useLoading } from '@/contexts/LoadingContext';

const PlayFrame = () => {
  const { setRomUrl, romUrl, setSelectedRom } = useLoading();

  const closeFrame = () => {
    setSelectedRom(null)
    setRomUrl(false);
  }

  return (
    <div id="Emu-Frame" className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-80 flex items-center justify-center">
      <button
        className="absolute z-220 top-0 right-2 text-white bg-red-500 p-2 rounded"
        onClick={closeFrame}
      >
        ✕
      </button>

      <iframe
        src={romUrl}
        className="fixed w-[100%] h-[80%]"
        allowFullScreen
        title="Game Display"
      />
    </div>
  );
};

export default PlayFrame;