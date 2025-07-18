const images_to_prefetch = [
  '/images/arithmetica.jpeg',
  '/images/spoi.png',
  '/images/washedup.ico',
  '/certs/apscholar.png',
  '/certs/cathcon1.png',
  '/certs/cathcon2.png',
  '/certs/cathcon3.png',
  '/certs/inmo2025.png',
  '/certs/inoi2024-medal.png',
  '/certs/inoi2025-medal.png',
  '/certs/ioitc2024.png',
  '/certs/ioitc2025.png',
  '/certs/ioqm2025.png'
];

function prefetch_images() {
  images_to_prefetch.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

function update_year() {
  const year_span = document.getElementById("year");
  if (year_span) {
    year_span.textContent = new Date().getFullYear();
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  prefetch_images();
  update_year();
});