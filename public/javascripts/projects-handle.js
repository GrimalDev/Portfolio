/*-------------RENDER PROJECT CARDS FROM SEARCH PARAMS-------------*/
//for card rendering
const allCardsContainer = document.getElementsByClassName("cards__main-container")[0];
const allLanguageSelectors = document.getElementsByClassName("projects-view__sidebar__option__button");

//for pagination
const pageButtons = document.getElementsByClassName("page-selection__button");
let pageNumberCurrentEl = document.getElementById("page-selection__number__current");
let pageNumberMaxEl = document.getElementById("page-selection__number__max");

//all languages available
let allLanguages = [];

let activeQuery = {
    languages: [],
    page: 1,
    customSearch: "",
    getActiveQueries() {
        return {
            languages: this.languages,
            page: this.page,
            customSearch: this.customSearch
        }
    },
    reset() {
        this.languages = [];
        this.page = 1;
        this.customSearch = "";
    },
    removeParam(param) {
        if (param === "languages") {
            this.languages = [];
        } else if (param === "page") {
            this.page = 1;
        } else if (param === "customSearch") {
            this.customSearch = "";
        }
    },
    removeLanguage(language) {
        this.languages.splice(this.languages.indexOf(language), 1);
    }

}
let maxPageNumber; //Save the last page number to avoid unnecessary requests

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
        cardLink.classList.add("card__link");

        //set image background
        cardImage.style.backgroundImage = "url('/images/articles/" + project.img + "')";

        //add attributes
        cardLink.setAttribute("href", "/projects/view/" + project.slug);

        const languageName = allLanguages.find(language => language.id === project.languages_linked).name;

        //add text
        cardTitle.innerText = project.title + " (" + languageName + ")";
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
    pageNumberCurrentEl.innerText = currentPage;
    pageNumberMaxEl.innerText = maxPages;

    //enable all buttons
    for (let i = 0; i < pageButtons.length; i++) {
        pageButtons[i].removeAttribute("disabled");
    }

    //if current page is 1, disable previous button
    if (currentPage === 1 || currentPage < 0) {
        document.getElementById("page-selection__button__previous").setAttribute("disabled", "true");
    }

    //if current page is max, disable next button
    if (currentPage === maxPages || currentPage > maxPages) {
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

async function fetchProjects() {

    let query = "/projects/query?";

    //get all active queries and query with all of them
    const activeQueries = activeQuery.getActiveQueries();

    //add active queries to url
    if (activeQueries.languages.length > 0) {
        query += "languages=" + activeQueries.languages.join(",") + "&";
    }
    if (activeQueries.page > 1) {
        query += "page=" + activeQueries.page + "&";
    }
    if (activeQueries.customSearch !== "") {
        query += "search=" + activeQueries.customSearch + "&";
    }

    //remove last "&"
    query = query.slice(0, -1);

    let projects = await fetch(query);
    projects = await projects.json();

    //save maxpage number
    maxPageNumber = projects.maxPages;

    //clear all cards
    allCardsContainer.innerHTML = "";

    //rerender projects
    renderProjects(projects.data);

    //pagination buttons protector
    paginationButtonsProtector(activeQueries.page, projects.maxPages);
}

async function handleSelectors() {
    for (let i = 0; i < allLanguageSelectors.length; i++) {
        allLanguageSelectors[i].addEventListener("click", async (e) => {
            const targetId = e.target.id;

            selectorProtector(e);

            const language = targetId.split("-")[1];

            if (e.target.checked) {
                //add language to active queries
                activeQuery.languages.push(language);
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

                    //laguages empty
                    activeQuery.languages = [];

                    return;
                }

                //remove language from active queries
                activeQuery.removeLanguage(language);
            }

            //if languages contains 0 (all), remove all languages
            if (activeQuery.languages.includes("0")) {
                activeQuery.removeParam("languages");
            }

            //set page to 1
            activeQuery.page = 1;

            //fetch projects
            await fetchProjects();
        });
    }
}

function pageHandle() {
    for (let i = 0; i < pageButtons.length; i++) {
        pageButtons[i].addEventListener("click", async (e) => {

            //if desabled, return
            if (e.target.getAttribute("disabled") === "true") { return; }

            let pageOperand = 1;

            //if previous button is clicked, decrement page number
            if (e.target.id === "page-selection__button__previous") { pageOperand = -1; }

            //set page query
            activeQuery.page += pageOperand;
            await fetchProjects();
        });
    }
}

function searchInputHandler() {
    const searchInput = document.getElementById("projects-view__sidebar__search__input");
    const doneTypingTimer = 600;
    let typingTimer;

    searchInput.addEventListener("input", async (e) => {
        //wait 500ms since last input before querying
        clearTimeout(typingTimer);
        typingTimer = setTimeout(async () => {

            //set search param
            activeQuery.customSearch = e.target.value;

            await fetchProjects();
        }, doneTypingTimer);
    });
}

const initQuery = async () => {
    let firstPageProjects = await fetch("/projects/query");
    firstPageProjects = await firstPageProjects.json();

    //select all languages from list
    let allLanguagesEl = document.getElementsByClassName("projects-view__sidebar__option__label");
    for (let i = 0; i < allLanguagesEl.length; i++) {
        let id = allLanguagesEl[i].getAttribute("for").split("-")[1];
        id = parseInt(id);
        let name = allLanguagesEl[i].innerText;
        //add object to allLanguages based on id
        allLanguages.push({
            id: id,
            name: name
        });
    }

    //render first page of projects
    renderProjects(firstPageProjects.data);

    //firest save maxpage number
    maxPageNumber = firstPageProjects.maxPages;

    //handle language selection
    await handleSelectors();

    //buttons protector
    paginationButtonsProtector(parseInt(pageNumberCurrentEl.innerText), firstPageProjects.maxPages);

    //handle pagination
    pageHandle();

    searchInputHandler();
}

//on dom ready
document.addEventListener("DOMContentLoaded", initQuery);
