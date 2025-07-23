window.addEventListener('DOMContentLoaded', () => {
  console.log("[Deadshot → Badge] preload.js loaded");

  const originalSrc = "https://deadshot.io/promo/logo.webp";
  const newSrc = "https://badges.vencord.dev/badges/1001300745569718302/1-42811596f6d80dfd7e2e3c4640a664af5b0b79ce.gif";

  const replaceImages = () => {
    const images = document.querySelectorAll('img');

    console.log(`[Deadshot → Badge] Found ${images.length} image(s)`);

    images.forEach(img => {
      if (img.src === originalSrc) {
        console.log(`[Deadshot → Badge] Replacing image: ${img.src}`);
        img.src = newSrc;
      }
    });
  };

  // Run every 500ms
  setInterval(() => {
    console.log("[Deadshot → Badge] Running replacement check...");
    replaceImages();
  }, 500);
});
