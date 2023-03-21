/*-------------RENDER PROJECT CARDS FROM SEARCH PARAMS-------------*/
//for card rendering
const allCardsContainer = document.getElementById("cards__main-container");
const allLanguageSelectors = document.getElementsByClassName("projects-view__sidebar__option__button");

//for pagination
const pageButtons = document.getElementsByClassName("page-selection__button");
let pageNumberCurrentEl = document.getElementById("page-selection__number__current");
let pageNumberMaxEl = document.getElementById("page-selection__number__max");


//render projects
function renderProjects(projects) {
    //remove all cards
    allCardsContainer.innerHTML = "";

    //create all components
    projects.forEach(project => {
        const card = document.createElement("div");
        const cardBody = document.createElement("div");
        const cardImage = document.createElement("div");
        const cardTitle = document.createElement("p");
        const cardText = document.createElement("p");
        const cardLink = document.createElement("a");

        //add classes
        card.classList.add("card__container", "card__language-" + project.languages_linked);
        card.id = "project-" + project.id;
        cardImage.classList.add("card__image");
        cardBody.classList.add("card__body");
        cardTitle.classList.add("card__title");
        cardText.classList.add("card__text");

        //set image background
        cardImage.style.backgroundImage = "url('/images/articles/" + project.img + "')";

        //add attributes
        cardLink.setAttribute("href", "/projects/view/" + project.slug);

        //add text
        cardTitle.innerText = project.title + " (" + project.languages_linked + ")";
        cardText.innerText = project.description;

        //append animation
        card.classList.add("animate__popIn");

        //append components
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        card.appendChild(cardImage);
        card.appendChild(cardBody);
        card.appendChild(cardLink)
        allCardsContainer.appendChild(card);
    });
}

function selectorProtector(e) {
    //if "all" is selected, de-select all other languages
    if (e.target.id === "option-0" && e.target.checked) {
        //de-select all other languages
        unCheckAllSelectors();
    } else if (e.target.id !== "option-0" && e.target.checked) {
        //if "all" is selected
        if (document.getElementById("option-0").checked) {
            //de-select "all"
            document.getElementById("option-0").click();
            //remove all cards
            allCardsContainer.innerHTML = "";
        }
    }
}

function paginationButtonsProtector(currentPage, maxPages) {
    //update pagination
    pageNumberMaxEl.innerText = maxPages;

    //enable all buttons
    for (let i = 0; i < pageButtons.length; i++) {
        pageButtons[i].removeAttribute("disabled");
    }

    //if current page is 1, disable previous button
    if (currentPage === 1) {
        document.getElementById("page-selection__button__previous").setAttribute("disabled", "true");
    }

    //if current page is max, disable next button
    if (currentPage === maxPages) {
        document.getElementById("page-selection__button__next").setAttribute("disabled", "true");
    }
}

function getActiveSelectors() {
    const activeSelectors = [];
    for (let i = 0; i < allLanguageSelectors.length; i++) {
        if (allLanguageSelectors[i].checked) {
            activeSelectors.push(allLanguageSelectors[i].id.split("-")[1].toString());
        }
    }
    return activeSelectors;
}

function unCheckAllSelectors() {
    for (let i = 0; i < allLanguageSelectors.length; i++) {
        //if checked, 'click' it
        if (allLanguageSelectors[i].checked) {
            allLanguageSelectors[i].click();
        }
    }
}

//buttons reset function
function resetButtons(maxPages) {
    //reset page number
    pageNumberCurrentEl.innerText = 1;
    pageNumberMaxEl.innerText = maxPages;

    //buttons protector
    paginationButtonsProtector(parseInt(pageNumberCurrentEl.innerText), maxPages);
}

async function querySelectorHandler(selectorId) {
    //get language name from id
    const language = selectorId.split("-")[1];

    //if "all" is selected, query all projects
    if (language === "0") {
        let projects = await fetch("/projects/query");
        projects = await projects.json();
        renderProjects(projects.data);
        //buttons protector
        paginationButtonsProtector(parseInt(pageNumberCurrentEl.innerText), projects.maxPages);
        return;
    }

    //get all selected languages and query with all of them
    const activeSelectors = getActiveSelectors().join(",");

    //query all languages selected in a encoded list
    let projects = await fetch("/projects/query?languages=" + activeSelectors);
    projects = await projects.json();

    //rerender projects
    renderProjects(projects.data);

    //reset buttons and pagination
    resetButtons(projects.maxPages);
}

async function handleSelectors() {
    for (let i = 0; i < allLanguageSelectors.length; i++) {
        allLanguageSelectors[i].addEventListener("click", async (e) => {
            const targetId = e.target.id;

            selectorProtector(e);

            if (e.target.checked) {
                await querySelectorHandler(targetId);
            } else {

                //if all is unchecked, remove all cards
                if (targetId === "option-0") {
                    //clear all cards
                    allCardsContainer.innerHTML = "";
                    return;
                }

                //If all unchecked, set current and max page to 0
                if (!getActiveSelectors().length) {
                    allCardsContainer.innerHTML = "";
                    pageNumberCurrentEl.innerText = 1;
                    pageNumberMaxEl.innerText = 1;
                    return;
                }

                //if not all, query all languages selected in a encoded list
                const activeSelectors = getActiveSelectors().join(",");
                let projects = await fetch("/projects/query?languages=" + activeSelectors);
                projects = await projects.json();
                renderProjects(projects.data);

                //reset buttons and pagination
                resetButtons(projects.maxPages);
            }
        });
    }
}

function paginationHandler(target, maxPages) {

    let currentPage = parseInt(pageNumberCurrentEl.innerText);
    let pageOperand = +1;

    //if previous button is clicked, decrement page number
    if (target.id === "page-selection__button__previous") { pageOperand = -1; }

    //update page number
    pageNumberCurrentEl.innerText = (currentPage + pageOperand).toString();
    pageNumberMaxEl.innerText = maxPages;

    currentPage = parseInt(pageNumberCurrentEl.innerText);

    //buttons protector
    paginationButtonsProtector(currentPage, maxPages);
}

function pageHandle() {
    for (let i = 0; i < pageButtons.length; i++) {
        pageButtons[i].addEventListener("click", async (e) => {

            //if desabled, return
            if (e.target.getAttribute("disabled") === "true") { return; }

            pageNumberCurrentEl = document.getElementById("page-selection__number__current");
            pageNumberMaxEl = document.getElementById("page-selection__number__max");

            let pageOperand = +1;

            //if previous button is clicked, decrement page number
            if (e.target.id === "page-selection__button__previous") { pageOperand = -1; }

            const nextPage = parseInt(pageNumberCurrentEl.innerText) + pageOperand;

            //clear all cards
            allCardsContainer.innerHTML = "";

            //get all selected languages and query with all of them
            const activeSelectors = getActiveSelectors();
            let currentRequest = "";
            //if 'all' is selected, don't add any query
            if (activeSelectors.length && activeSelectors[0] !== "0") {
                currentRequest = `languages=${activeSelectors.join(",")}&`;
            }

            let projects = await fetch(`/projects/query?${currentRequest}page=${nextPage}`);
            projects = await projects.json();
            renderProjects(projects.data);

            //handle pagination buttons and page number
            paginationHandler(e.target, parseInt(projects.maxPages));
        });
    }
}

const initQuery = async () => {
    let firstPageProjects = await fetch("/projects/query");
    firstPageProjects = await firstPageProjects.json();

    //render first page of projects
    renderProjects(firstPageProjects.data);

    //handle language selection
    await handleSelectors();

    //buttons protector
    paginationButtonsProtector(parseInt(pageNumberCurrentEl.innerText), firstPageProjects.maxPages);

    //handle pagination
    pageHandle();
}

//on dom ready
document.addEventListener("DOMContentLoaded", initQuery);
