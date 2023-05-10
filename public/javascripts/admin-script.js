function imageDropHandler(file) {
  //add image to the input
  const imageInputEl = document.getElementById('project-image__input');
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  imageInputEl.files = dataTransfer.files;

  //display the image in the drop zone
  const imageDropEl = document.getElementById('project-image__drop-zone');
  imageDropEl.style.backgroundImage = `url(${URL.createObjectURL(file)})`;

  //change test in the drop zone to image name
  imageDropEl.innerHTML = file.name;
}

function moreFilesDropHandler(files) {
  //add list of files to the input
  const filesInputEl = document.getElementById('project-html-optional__input');
  const dataTransfer = new DataTransfer();
  for (let i = 0; i < files.length; i++) {
    dataTransfer.items.add(files[i]);
  }
  filesInputEl.files = dataTransfer.files;

  //display the list of files in the drop zone
  const filesDropEl = document.getElementById('project-html-optional__drop-zone');
  filesDropEl.innerHTML = '';
  for (let i = 0; i < files.length; i++) {
    const fileEl = document.createElement('span');
    fileEl.classList.add('file-list');
    //display only 20 ladt characters of the file name
    fileEl.innerHTML = files[i].name;
    filesDropEl.appendChild(fileEl);
  }
}

function pdfDropHandler(file) {
  //add image to the input
  const imageInputEl = document.getElementById('project-pdf__input');
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  imageInputEl.files = dataTransfer.files;

  //display the image in the drop zone
  const imageDropEl = document.getElementById('project-pdf__drop-zone');
  imageDropEl.style.backgroundImage = `url(${URL.createObjectURL(file)})`;

  //change test in the drop zone to image name
  imageDropEl.innerHTML = file.name;
}

function imageDropInit() {
  const imageDropEl = document.getElementById('project-image__drop-zone');
  const imageInputEl = document.getElementById('project-image__input');

  //style the drop zone when a file is hovered over
  imageDropEl.addEventListener('dragover', (e) => {
    e.preventDefault();

    //active class active for 2s
    imageDropEl.classList.add('active');
    setTimeout(() => {
      imageDropEl.classList.remove('active');
    }, 2000);
  });

  imageDropEl.addEventListener('dragenter', (e) => {
    e.preventDefault();
  });

  imageDropEl.addEventListener('dragleave', (e) => {
    e.preventDefault();
  });

  imageDropEl.addEventListener('drop', (e) => {
    e.preventDefault();
    //get the file
    imageDropHandler(e.dataTransfer.files[0]);
  });

  //on click on the drop zone, open the file explorer
  imageDropEl.addEventListener('click', (e) => {
    //open the file explorer
    imageInputEl.click();
  });

  //when a file is selected, call the imageDropHandler
  imageInputEl.addEventListener('change', (e) => {
    e.preventDefault();

    imageDropHandler(e.target.files[0]);
  });
}

function moreFilesInit() {
  const filesDropEl = document.getElementById('project-html-optional__drop-zone');
  const filesInputEl = document.getElementById('project-html-optional__input');

  //style the drop zone when a file is hovered over
  filesDropEl.addEventListener('dragover', (e) => {
    e.preventDefault();

    //active class active for 2s
    filesDropEl.classList.add('active');
    setTimeout(() => {
      filesDropEl.classList.remove('active');
    }, 2000);
  });

  filesDropEl.addEventListener('dragenter', (e) => {
    e.preventDefault();
  });

  filesDropEl.addEventListener('dragleave', (e) => {
    e.preventDefault();
  });

  filesDropEl.addEventListener('drop', (e) => {
    e.preventDefault();
    //get the file
    imageDropHandler(e.dataTransfer.files[0]);
  });

  //on click on the drop zone, open the file explorer
  filesDropEl.addEventListener('click', (e) => {
    //open the file explorer
    filesInputEl.click();
  });

  //when a file is selected, call the imageDropHandler
  filesInputEl.addEventListener('change', (e) => {
    e.preventDefault();

    moreFilesDropHandler(e.target.files);
  });
}

function pdfDropInit() {
  const pdfDropEl = document.getElementById('project-pdf__drop-zone');
  const pdfInputEl = document.getElementById('project-pdf__input');

  //style the drop zone when a file is hovered over
  pdfDropEl.addEventListener('dragover', (e) => {
    e.preventDefault();

    //active class active for 2s
    pdfDropEl.classList.add('active');
    setTimeout(() => {
      pdfDropEl.classList.remove('active');
    }, 2000);
  });

  pdfDropEl.addEventListener('dragenter', (e) => {
    e.preventDefault();
  });

  pdfDropEl.addEventListener('dragleave', (e) => {
    e.preventDefault();
  });

  pdfDropEl.addEventListener('drop', (e) => {
    e.preventDefault();
    //get the file
    pdfDropHandler(e.dataTransfer.files[0]);
  });

  //on click on the drop zone, open the file explorer
  pdfDropEl.addEventListener('click', (e) => {
    //open the file explorer
    pdfInputEl.click();
  });

  //when a file is selected, call the pdfDropHandler
  pdfInputEl.addEventListener('change', (e) => {
    e.preventDefault();

    pdfDropHandler(e.target.files[0]);
  });
}

function addProjectHandler() {
  //get the form data
  const formData = new FormData(document.getElementById('add-project__form'));

  //send the data to the server
  fetch('/projects/add', {
    method: 'POST',
    body: formData,
  }).then(async (res) => {
    const form = document.getElementById('add-project__form')

    //save the responded json
    const response = await res.json();
    console.log(response);

    if (response.status === "ok") {
      //style the form with validated class for 2s
      form.classList.add('validated');
      setTimeout(() => {
        form.classList.remove('validated');
      }, 2000);
      return;
    }

    //display the error message
    const errorEl = document.getElementById('add-project__error');
    errorEl.innerHTML = response.message;
    setTimeout(() => {
      errorEl.innerHTML = '';
    }, 5000);

    //style the form with invalid class for 2s
    form.classList.add('invalid');
    setTimeout(() => {
      form.classList.remove('invalid');
    }, 2000);
  }).catch((err) => {
    const form = document.getElementById('add-project__form')

    //style the form with invalid class for 2s
    form.classList.add('invalid');
    setTimeout(() => {
      form.classList.remove('invalid');
    }, 2000);
  });
}

function addProjectInit() {
  //lister for project submit
  document.getElementById('add-project__form').addEventListener('submit', (e) => {
    e.preventDefault();
    addProjectHandler();
  });
  //lsiten on reset button click
  document.getElementById('add-project__form__reset').addEventListener('click', newProjectResetHandler);
}

function newProjectResetHandler() {
  //clear the image drop zones
  const dropZones = document.getElementsByClassName('drop-zone');
  for (let i = 0; i < dropZones.length; i++) {
    dropZones[i].style.backgroundImage = '';
  }

  //Specific to the image drop zone
  const imageDropEl = document.getElementById('project-image__drop-zone');
  imageDropEl.innerHTML = 'Image du projet<br>Drop ou click pour ajouter une image';
  //Specific to the ZIP drop zone
  const filesDropEl = document.getElementById('project-html-optional__drop-zone');
  filesDropEl.innerHTML = 'Html article (optionnel)<br>Format zip<br>Drop ou click pour ajouter des fichier';
  //Specific to the PDF drop zone
  const pdfDropEl = document.getElementById('project-pdf__drop-zone');
  pdfDropEl.innerHTML = 'Fichier pour téléchargement (si nécessaire)<br>En pdf !';
}

const init = async () => {
  imageDropInit();
  moreFilesInit();
  pdfDropInit();

  addProjectInit();
}

window.onload = init;