//------------menu open and close------------

const menuUnfold = document.querySelector(".menu-unfold");

let clickOutMenuChangeStatus = (e) => {
    if (e.target.matches(".menu") && !menuUnfold.classList.contains("menu-unfold-true")) {
        menuUnfold.classList.toggle("menu-unfold-true");

    } else if (!e.target.matches(".menu-unfold") && menuUnfold.classList.contains("menu-unfold-true")) {
        menuUnfold.classList.toggle("menu-unfold-true");
    }
};

window.addEventListener("click", clickOutMenuChangeStatus, false)
window.addEventListener("touchend", clickOutMenuChangeStatus, false)