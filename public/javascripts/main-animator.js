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
window.addEventListener("touchstart", clickOutMenuChangeStatus)