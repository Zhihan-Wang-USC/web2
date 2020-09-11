window.addEventListener('DOMContentLoaded', function (e) {

    var waterfall = new Waterfall({ minBoxWidth: 400 });

    // button click handle
    var btn = document.getElementById('add-btn');
    var boxHandle = newNode();
    btn.addEventListener('click', function () {

        waterfall.addBox(boxHandle());
    });

    var scaleUpbtn = document.getElementById('scaleup-btn');
    scaleUpbtn.addEventListener('click', function () {

        waterfall.minBoxWidth += 50;
        waterfall.compose(true);
    });

    var scaleDownbtn = document.getElementById('scaledown-btn');
    scaleDownbtn.addEventListener('click', function () {

        waterfall.minBoxWidth -= 50;
        waterfall.compose(true);
    });

    window.onscroll = function () {
        var i = waterfall.getHighestIndex();
        if (i > -1) {
            // get last box of the column
            var lastBox = Array.prototype.slice.call(waterfall.columns[i].children, -1)[0];
            if (checkSlide(lastBox)) {
                var count = 5;
                while (count--) waterfall.addBox(boxHandle());
            }
        }
    };

    function checkSlide(elem) {
        if (elem) {
            var screenHeight = (document.documentElement.scrollTop || document.body.scrollTop) +
                (document.documentElement.clientHeight || document.body.clientHeight);
            var elemHeight = elem.offsetTop + elem.offsetHeight / 2;

            return elemHeight < screenHeight;
        }
    }

    function newNode() {
        var size = Array(7).fill().map((_,i) => toString(i));
        let i = 0;

        return function () {

            var box = document.createElement('div');
            box.className = 'wf-box';
            var image = document.createElement('img');
            // image.src = "http://placehold.it/" + size[i] + '/' + color[i] + '/fff';
            image.src = `../images/${i + 1}.png`;
            box.appendChild(image);
            var content = document.createElement('div');
            content.className = 'content';
            var title = document.createElement('h3');
            title.appendChild(document.createTextNode('Heading'));
            content.appendChild(title);
            var p = document.createElement('p');
            p.appendChild(document.createTextNode('Content here'));
            content.appendChild(p);
            box.appendChild(content);

            if (++i === size.length) i = 0;

            return box;
        };
    }
});