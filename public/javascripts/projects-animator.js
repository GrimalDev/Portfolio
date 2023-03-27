//------------Animation card perpective------------
const cards = document.getElementsByClassName("card__container");
let mousePositions = [];
let counter = 0;
const updateRate = 10;
const isTimeToUpdate = () => {
    return counter++ % updateRate === 0;
};

const updateTransformStyle = (el, x, y) => {
    const style = "rotateX(" + x + "deg) rotateY(" + y + "deg)";
    el.style.transform = style;
    el.style.webkitTransform = style;
    el.style.mozTransform = style;
    el.style.msTransform = style;
    el.style.oTransform = style;
}

const removeTransformStyle = (el) => {
    el.style.transform = "";
    el.style.webkitTransform = "";
    el.style.mozTransform = "";
    el.style.msTransform = "";
    el.style.oTransform = "";
}

function setMousePositions() {
    console.log(cards);
    console.log(Object.values(cards));
    console.log(Object.keys(cards));
    console.log(Array.from(cards));

    //set mouse origin for each card
    for (let i = 0; i < cards.length; i++) {
        //generate new mouse object for each card
        const mouse = {
            _x: 0,
            _y: 0,
            x: 0,
            y: 0,
            updatePosition: function(event) {
                const e = event;
                this.x = e.clientX - this._x;
                this.y = (e.clientY - this._y) * -1;
            },
            setOrigin: function(e) {
                this._x = e.offsetLeft + Math.floor(e.offsetWidth/2);
                this._y = e.offsetTop + Math.floor(e.offsetHeight/2);
            },
            show: function() { return '(' + this.x + ', ' + this.y + ')'; }
        }

        //set mouse origin for each card
        mouse.setOrigin(cards[i]);

        //append mouse object to mousePositions array
        mousePositions.push(mouse);
    }
}

function update(e) {
    for (let i = 0; i < mousePositions.length; i++) {
        mousePositions[i].updatePosition(e);

        //if target is child of current card, remove transform style
        if (e.target.closest(".card__container") === cards[i]) {
            //if card has moved from origin, remove transform style
            if (e.target.closest(".card__container").style.transform !== "") {
                removeTransformStyle(cards[i]);
            }
            continue;
        }
        updateTransformStyle(
            cards[i],
            (mousePositions[i].y / cards[i].offsetHeight / 2).toFixed(2),
            (mousePositions[i].x / cards[i].offsetWidth / 2).toFixed(2)
        );
    }
}


//update card perspective on mouse move
function updateCardPerspective(e) {
    if (isTimeToUpdate()) {
        update(e);
    }
}

const initPerspective = () => {
    setMousePositions();
    window.addEventListener("mousemove", updateCardPerspective);
}

document.addEventListener("DOMContentLoaded", () => {
    initPerspective();
});