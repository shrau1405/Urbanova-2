// Initialize AOS (Animate On Scroll) library for scroll animations
AOS.init({
  duration: 800,     // Animation duration in milliseconds
  once: true         // Animation will happen only once while scrolling down
});

// Variable to track the current slide index
let currentSlide = 0;

// Select all elements with the class "slide" and store them in a NodeList
const slides = document.querySelectorAll(".slide");

// Get the total number of slides
const totalSlides = slides.length;

// Select the slider track element where the slides are horizontally arranged
const sliderTrack = document.getElementById("sliderTrack");

// Function to update the slider position based on currentSlide
function updateSlider() {
  // Translate the slider track horizontally to show the current slide
  sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Function to change the slide in a given direction (1 = next, -1 = previous)
function moveSlide(direction) {
  // Increment or decrement the currentSlide based on direction
  currentSlide += direction;

  // Wrap around to last slide if moving before the first
  if (currentSlide < 0) currentSlide = totalSlides - 1;
  // Wrap around to first slide if moving after the last
  else if (currentSlide >= totalSlides) currentSlide = 0;

  // Update the slider display
  updateSlider();
}

// Automatically move to the next slide every 5 seconds
setInterval(() => {
  moveSlide(1); // Move one slide forward
}, 5000);
