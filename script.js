// Simple JS for future enhancements
console.log("Portfolio loaded");
const form = document.querySelector(".contact-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const action = form.getAttribute("action");

  const response = await fetch(action, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (response.ok) {
    form.innerHTML =
      "<p><strong>Thanks!</strong> Your message has been sent.</p>";
  } else {
    alert("Oops! Something went wrong.");
  }
});
