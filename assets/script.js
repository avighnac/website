async function load_component(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

function update_year() {
  const year_span = document.getElementById("year");
  if (year_span) {
    year_span.textContent = new Date().getFullYear();
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  await load_component("header-placeholder", "/components/header.html");
  await load_component("footer-placeholder", "/components/footer.html");
  update_year();
});