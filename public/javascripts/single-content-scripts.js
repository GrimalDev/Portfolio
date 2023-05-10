const init = () => {
  //if an iframe is present
  if (document.querySelector('iframe')) {
    //notion has special classes that behave badly in an iframe
    notionIntegration();
    //resize the iframe to barely fit its content
    resizeIFrameToFitContent();
    //resize iframe if widow is resized
    window.addEventListener('resize', resizeIFrameToFitContent);
  }

  downloadButton();
}

function notionIntegration() {

  //add target="_parent" to the iframe's every links except is class table_of_contents-link is there
  const iFrame = document.getElementById('article-body__iframe');
  const iFrameLinks = iFrame.contentWindow.document.getElementsByTagName('a');
  for (let i = 0; i < iFrameLinks.length; i++) {
    if (!iFrameLinks[i].classList.contains('table_of_contents-link')) {
      iFrameLinks[i].setAttribute('target', '_parent');
    }

    //if the links parent node is a div with class source
    if (iFrameLinks[i].parentNode.classList.contains('source')) {
      iFrameLinks[i].setAttribute('target', '_blank');
    }
  }

  //if there is a div with class source in the iframe, create an iframe with the source's url
  const sourceDivs = iFrame.contentWindow.document.querySelectorAll('div.source');

  //number of items in the sourceDivs array
  const sourceDivsLength = sourceDivs.length;

  for (let i = 0; i < sourceDivsLength; i++) {
    //get the url from the href attribute of the child a tag
    const sourceUrl = sourceDivs[i].querySelector('a').getAttribute('href');

    //create the iframe to hold the preview
    const sourceIframe = document.createElement('iframe');
    sourceIframe.classList.add('source__iframe');
    sourceIframe.setAttribute('src', sourceUrl);
    sourceIframe.setAttribute('frameborder', '0');
    sourceIframe.setAttribute('allowfullscreen', 'true');
    sourceIframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

    sourceIframe.style.width = '100%';
    sourceIframe.style.height = '30rem';

    //only put the iframe in the div
    sourceDivs[i].innerHTML = '';
    sourceDivs[i].appendChild(sourceIframe);
  }

  //apply notion fix stylesheet to the iframe
  const iFrameHead = iFrame.contentWindow.document.getElementsByTagName('head')[0];
  const notionFixStyle = document.createElement('link');
  notionFixStyle.setAttribute('rel', 'stylesheet');
  notionFixStyle.setAttribute('href', '/stylesheets/notion-fixes.css');
  iFrameHead.appendChild(notionFixStyle);
}

//resize the iframe to barely fit its content
function resizeIFrameToFitContent() {
  const iFrame = document.getElementById('article-body__iframe');

  iFrame.height = iFrame.contentWindow.document.body.scrollHeight + 20;
}

//animation to wait on download button click
function downloadButton() {
  const downloadPopup = document.querySelector('.download-popup');
  const downloadPopupProgressBar = document.querySelector('.download-popup__progress-bar__fill');
  const donwloadButton = document.querySelector('.single-project__download');

  //add event listener to the download button
  donwloadButton.addEventListener('click',  (e) => {
    //set time progress duration
    const progressDuration = 1500;

    //set the progress bar to 0
    downloadPopupProgressBar.style.width = '0%';
    //set transition duration
    downloadPopupProgressBar.style.transition = `width ${progressDuration}ms linear`;

    //show the download popup by activating active class untill the download is complete
    downloadPopup.classList.add('active');

    //fill for 3 seconds progressively to 100% with the css transition
    setTimeout(() => {
      downloadPopupProgressBar.style.width = '100%';
    }, 100);

    //remove the active class after 500ms
    setTimeout(() => {
      downloadPopup.classList.remove('active');
    }, progressDuration + 500);
  });
}

window.addEventListener('load', init);