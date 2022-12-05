async function applyDataTemplate(json) {
    let mainElement = await document.querySelector('main');

    let tempNewCategoryBool = false;
    let tempNewSecondaryContainer = false;

    //loop through table lines
    json.forEach(obj => {

        switch (obj['content_level']) {
            //see if line is a title, a list element or a secondary argument
            case 1:
                let cvCategory = document.createElement('div');
                cvCategory.className += 'cv-category';

                let cvCategoryTitle = document.createElement('div');
                cvCategoryTitle.className += 'cv-category-title';
                cvCategoryTitle.innerText = obj['content'];

                cvCategory.append(cvCategoryTitle);
                mainElement.append(cvCategory);

                if (!tempNewCategoryBool) tempNewCategoryBool = !tempNewCategoryBool; // invert the new category bool
                break;
            case 2:
                if (tempNewCategoryBool) {
                    let contentContainerElement = document.createElement('ul');
                    contentContainerElement.className += 'cv-content-container';

                    (async () => {
                        let lastCVCategory = await mainElement.querySelector('.cv-category:last-child'); // Get last to append to

                        lastCVCategory.append(contentContainerElement);

                    })();

                    tempNewCategoryBool = !tempNewCategoryBool
                }
                let contentElement = document.createElement('li');
                contentElement.className += 'cv-content';
                contentElement.innerText = obj['content'];

                (async () => {
                    let lastCVCategory = await mainElement.querySelector('.cv-category:last-child'); // Get last to append to
                    let lastCVContentContainer = await lastCVCategory.querySelector('.cv-content-container:last-child');

                    lastCVContentContainer.append(contentElement); //append to last child
                })();

                if (!tempNewSecondaryContainer) tempNewSecondaryContainer = !tempNewSecondaryContainer;
                break;
            case 3:
                if (tempNewSecondaryContainer) {
                    let secondaryContentContainerLi = document.createElement('li');
                    secondaryContentContainerLi.className += 'cv-content-secondary-container';
                    let secondaryContentContainerUl = document.createElement('ul');
                    (async () => {
                        let lastCVCategory = await mainElement.querySelector('.cv-category:last-child'); // Get last to append to
                        let lastCVContentContainer = await lastCVCategory.querySelector('.cv-content-container:last-child');

                        secondaryContentContainerLi.append(secondaryContentContainerUl);
                        lastCVContentContainer.append(secondaryContentContainerLi);
                    })();
                    tempNewSecondaryContainer = !tempNewSecondaryContainer;
                }

                let contentSecondaryElement = document.createElement('li');
                contentSecondaryElement.className += 'cv-content-secondary';
                contentSecondaryElement.innerText = obj['content'];

                (async () => {
                    let lastCVCategory = await mainElement.querySelector('.cv-category:last-child'); // Get last to append to
                    let lastCVContentContainer = await lastCVCategory.querySelector('.cv-content-container:last-child');
                    let lastCVContentSecondaryContainer = await lastCVContentContainer.querySelector('.cv-content-secondary-container:last-child');
                    let lastCVContentSecondaryContainerUl = await lastCVContentSecondaryContainer.querySelector('ul'); //get list from last secondary element to append to

                    lastCVContentSecondaryContainerUl.append(contentSecondaryElement);  //append to last child
                })();
        }

    });

    //base template exemple
    /*        <div id="cv-degrees" class="cv-category">
                <div class="cv-category-title">Diplômes</div>
                <ul class="cv-content-container">
                    <li class="cv-content">2021 - BTS SIO SLAM - Ecole IRIS</li>
                    <li class="cv-content">2020 - Abi Bac S mention Bien</li>
                    <li class="cv-content-secondary-container">
                        <ul>
                            <li class="cv-content-secondary">(Double diplôme franco-allemand)</li>
                        </ul>
                    </li>
                    <li class="cv-content">2016 - Technicien Son et Lumière (Allemagne)</li>
                </ul>
            </div>*/
}

async function cvDataFetch() {
    const res = await fetch('/getcvdata');
    if (res.ok) { // if HTTP-status is 200-299
        let json = await res.json(); // Get response body
        await applyDataTemplate(json)
    } else {
        console.error("HTTP-Error: " + res.status);
    }
}

cvDataFetch().then(r => { if(r) console.log(r); } );