//------------Bug fix on devices that simulate both click and touch------------
// function handleInteraction(evt) {
//     evt.preventDefault()
// }
// document.addEventListener('touchstart', handleInteraction)
// document.addEventListener('click', handleInteraction)
// document.addEventListener('touchmove', handleInteraction)

//------------nav slide up and down on scroll------------
const nav = document.querySelector("nav.scroll-animate");
let lastScrollTop = document.documentElement.scrollTop;
const scrollNav = () => {
    let curentScrollTop = document.documentElement.scrollTop;
    if (curentScrollTop > lastScrollTop) {
        nav.style.top = "-100px";
    } else {
        nav.style.top = "0";
    }
    lastScrollTop = curentScrollTop;
};

window.addEventListener("scroll", scrollNav);
// window.addEventListener("touchmove", scrollNav);

//------------menu open and close------------

const menuUnfold = document.querySelector(".menu-unfold");
let clickOutMenuChangeStatus = (e) => {
    if (e.target.matches(".menu") && !menuUnfold.classList.contains("menu-unfold-true")) {
        menuUnfold.classList.toggle("menu-unfold-true");

    } else if (!e.target.matches(".menu-unfold") && menuUnfold.classList.contains("menu-unfold-true")) {
        menuUnfold.classList.toggle("menu-unfold-true");
    }
};

window.addEventListener("click", clickOutMenuChangeStatus)

//------------darkreader------------
import darkreader from "https://cdn.jsdelivr.net/npm/darkreader@4.9.58/+esm";

function darkReaderInit() {
  //create element button darkreader
  const darkReaderButton = document.createElement("button");
  //class darkreader-button and darkreader
  darkReaderButton.className = "darkreader-button";
  darkReaderButton.setAttribute("aria-label", "Activate dark mode");
  darkReaderButton.setAttribute("aria-checked", "false");
  darkReaderButton.setAttribute("role", "checkbox");
  //add the button to the dom for every page
  document.body.appendChild(darkReaderButton);

  //detect touch screen
  darkReaderButton.addEventListener("click", darkReaderEvent);

  // Enable when the system color scheme is dark.
  darkreader.auto(false);
}

function darkReaderEvent(e) {
  e.preventDefault();

  const darkReaderButton = e.target;

  //change aria-checked
  darkReaderButton.setAttribute(
    "aria-checked",
    darkReaderButton.getAttribute("aria-checked") === "true" ? "false" : "true"
  );

  //trigger body animation based on aria-checked
  if (darkReaderButton.getAttribute("aria-checked") === "true") {
    document.body.classList.remove("background-fill-light");
    document.body.classList.add("background-fill-dark");

    darkreader.enable({
      brightness: 100,
      contrast: 90,
      sepia: 10
    });
  } else {
    document.body.classList.remove("background-fill-dark");
    document.body.classList.add("background-fill-light");

    darkreader.disable();
  }
}

window.addEventListener("load", darkReaderInit);