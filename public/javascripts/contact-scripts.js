//------------form textarea text left------------
const textArea = document.getElementById("message");
const textIndexContainer = document.getElementById("message__char-count");
const textIndex = document.getElementById("message__char-count__index");
const statusMessage = document.getElementById("contact__form__status-message");

textArea.addEventListener("input", function () {
    //display current left characters
    textIndex.innerText = textArea.value.length;

    //change color of text index based on characters left
    //the lesser characters left, the more it goes from green to red
    const max = parseInt(textIndexContainer.innerText.split("/")[1].trim());
    const red = Math.floor((textArea.value.length / max) * 255);
    const green = 255 - red;

    textIndex.style.color = `rgb(${red}, ${green}, 0)`;

    //if text too long, can't enter more
    if (textArea.value.length > max) {
        textArea.value = textArea.value.substring(0, max);
        textArea.classList.toggle("status-bad");
    } else {
        textArea.classList.toggle("status-bad", false);
    }
});

//------------form validation animation------------

//listen for submit
const form = document.getElementById("contact__form");

form.addEventListener("submit", async function (e) {
  //prevent default submit
  e.preventDefault();

  //if button is disabled, do nothing
  if (document.getElementById("form__submit").disabled) {
      return;
  }

  //hide error message if it was displayed
  statusMessage.classList.toggle("hidden", true);
  //hide success message if it was displayed
  statusMessage.classList.toggle("status-good", false);

  //get all inputs
  const inputs = document.getElementsByClassName("form__input");

  //check if all inputs are filled
  let allFilled = true;
  Object.values(inputs).forEach((input) => {
      input.classList.toggle("status-bad", false); //remove shake animation

      if (!input.value) {
          //if not all filled, shake the field
          input.classList.toggle("status-bad");
          allFilled = false;
      }
  });

  if (!allFilled) {
      return;
  }

  //if all filled, send the form and get the response
  const formData = new URLSearchParams(new FormData(form));
  const response = await fetch(form.action, {
      method: "POST",
      body: formData,
  });

  const responseJson = await response.json();

  //if response is nook, display success message
  if (responseJson.status === 'nook') {
      statusMessage.innerText = responseJson.message;
      statusMessage.classList.toggle("hidden");

      return;
  }

  //if response is ok, display success message
  statusMessage.classList.toggle("status-good", true);
  statusMessage.innerText = "Message sent successfully!";
  statusMessage.classList.toggle("hidden");

  //disable submit button
  document.getElementById("form__submit").disabled = true;
})