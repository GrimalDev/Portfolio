//------------Animation card perpective------------
const cardsMainContainer = document.getElementsByClassName("cards__main-container")[0];
const cards = document.getElementsByClassName("card__container");

let counter = 0;
const updateRate = 10;
const isTimeToUpdate = () => {
    return counter++ % updateRate === 0;
};

//set mouse origin
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

mouse.setOrigin(cardsMainContainer);

const update = (e) => {
    mouse.updatePosition(e);
    for (let i = 0; i < cards.length; i++) {
        //if target is child of current card, remove transform style
        if (e.target.closest(".card__container") === cards[i]) {
            //if card has moved from origin, remove transform style
            if (e.target.closest(".card__container").style.transform !== "") {
                removeTransformStyle(cards[i]);
            }
            continue;
        }

        let xPosition = (mouse.y / cards[i].offsetHeight / 2).toFixed(2)
        let yPosition = (mouse.x / cards[i].offsetWidth / 2).toFixed(2)

        //card max rotation
        if (xPosition > .2) xPosition = .2;
        if (xPosition < -.2) xPosition = -.2;
        if (yPosition > .2) yPosition = .2;
        if (yPosition < -.2) yPosition = -.2;

        updateTransformStyle(
            cards[i],
            xPosition,
            yPosition
        );
    }
}

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

//update card perspective on mouse move
function updateCardPerspective(e) {
    if (isTimeToUpdate()) {
        update(e);
    }
}

window.addEventListener("mousemove", updateCardPerspective);