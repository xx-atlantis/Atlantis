// components/LiveStreamPlayer.jsx
import { useRef, useEffect } from "react";

const LiveStreamPlayer = () => {
  const videoRef = useRef(null);
  const loadingRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const loading = loadingRef.current;

    if (!video || !loading) return;

    const handleLoadStart = () => {
      loading.style.display = "block";
    };

    const handleCanPlay = () => {
      loading.style.display = "none";
    };

    const handleError = (e) => {
      loading.textContent =
        "Error loading stream. Check connection or try refreshing.";
      console.error("Video error:", e);
    };

    // Optional: Request fullscreen on click for better viewing
    const handleClick = () => {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    };

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.addEventListener("click", handleClick);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      video.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="video-container justify-center flex">
      <div ref={loadingRef} className="loading">
        Loading stream...
      </div>
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        playsInline
        poster="https://via.placeholder.com/640x360/000/fff?text=Live+Stream" // Add a real poster if available
        className="video-player"
      >
        <source
          src="https://cdn03isb-n.tamashaweb.com:8087/jazzauth/PKvSA-TOT-abr/live/PAKvsSA2025_480p/chunks.m3u8"
          type="application/x-mpegURL"
        />
        Your browser does not support the video tag or HLS streaming. Try using
        a modern browser or VLC.
      </video>
    </div>
  );
};

export default LiveStreamPlayer;
