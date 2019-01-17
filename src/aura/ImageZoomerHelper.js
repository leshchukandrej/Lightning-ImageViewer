/**
 * Created by ctuser on 08.01.2019.
 */
({

    zoom: 1,

    setLensPosition: function (component, event) {

        var img, lens, pos, x, y, lensShadow, zoom;

        zoom = component.get('v.zoom');

        img = component.find('imgContainer').getElement().querySelector('img')
        lens = component.find('lens').getElement();
        lensShadow = component.find('lensShadow').getElement();

        /* Get the cursor's x and y positions: */
        pos = this.getCursorPos(event, img, lens, zoom);

        this.calculateLensPosition(event, lens);

        if (!pos) {
            return
        }

        /* Calculate the position of the lens: */
        x = pos.x;
        y = pos.y;

        let xMax = img.offsetWidth - lens.offsetWidth / zoom;

        if (x > xMax) {
            x = xMax;
        } else if (x < 0) {
            x = 0;
        }

        let yMax = img.offsetHeight - lens.offsetHeight / zoom;

        if (y > yMax) {
            y = yMax;
        } else if (y < 0) {
            y = 0
        }


        lens.style.backgroundImage = "url('" + img.src + "')";
        lens.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
        lens.style.backgroundPosition = "-" + (x * zoom) + "px -" + (y * zoom) + "px";

        lensShadow.style.left = x + "px";
        lensShadow.style.top = y + "px";

        lensShadow.style.width = lens.offsetWidth / zoom + 'px'
        lensShadow.style.height = lens.offsetHeight / zoom + 'px'
    },

    getCursorPos: function (e, img, zoomer, zoom) {
        var a, x = 0, y = 0;
        if (!img) {
            return
        }
        /* Get the x and y positions of the image: */
        a = img.getBoundingClientRect();
        /* Calculate the cursor's x and y coordinates, relative to the image: */
        x = e.pageX - a.left - zoomer.offsetWidth / (zoom * 2) - window.pageXOffset
        y = e.pageY - a.top - zoomer.offsetHeight / (zoom * 2) - window.pageYOffset
        return {x: x, y: y};
    },

    calculateLensPosition: function (event, lens) {
        // debugger
        let top, left, shift;

        shift = 50;

        if (document.documentElement.clientWidth > event.clientX + lens.offsetWidth + shift*2) {
            left = (event.clientX + shift);
        } else {
            left = (event.clientX - lens.offsetWidth - shift);
        }

        if (document.documentElement.clientHeight > event.clientY + lens.offsetHeight + shift*2) {
            top = (event.clientY + shift);
        } else {
            top = (document.documentElement.clientHeight - shift) - lens.offsetHeight
        }
        lens.style.left = left + 'px'
        lens.style.top = top + 'px'
    },

    setFullViewImgSize: function (img, fullSizeImageBlock, isRotated, zoom) {

        let maxWidth = document.documentElement.clientWidth - 60;
        let maxHeight = document.documentElement.clientHeight - 60;

        let width, height, imgProportions, screenProportions, x, y;

        if (!isRotated) {
            x = img.naturalWidth;
            y = img.naturalHeight;
        } else {
            x = img.naturalHeight;
            y = img.naturalWidth;
        }

        //calculate width and height by image and screen size and proportions

        screenProportions = maxWidth / maxHeight;
        imgProportions = x / y;

        if (x < maxWidth && y < maxHeight) {
            width = x;
            height = y;
        } else if (x > maxWidth && y < maxHeight) {
            width = maxWidth;
            height = maxWidth / imgProportions;
        } else if (x < maxWidth && y > maxHeight) {
            height = maxHeight;
            width = maxHeight * imgProportions;
        } else if (x > maxWidth && y > maxHeight) {
            if (screenProportions > imgProportions) {
                height = maxHeight;
                width = maxHeight * imgProportions;
            } else if (screenProportions < imgProportions) {
                width = maxWidth;
                height = maxWidth / imgProportions;
            }
        }

        if (!width || !height) {
            width = maxWidth;
            height = maxHeight;
        }

        if (!zoom) {
            zoom = 1;
        }

        if (isRotated) {
            fullSizeImageBlock.style.backgroundSize = height * zoom + 'px ' + width * zoom + 'px';
            fullSizeImageBlock.style.width = height * zoom + 'px';
            fullSizeImageBlock.style.height = width * zoom + 'px';
        } else {
            fullSizeImageBlock.style.backgroundSize = width * zoom + 'px ' + height * zoom + 'px';
            fullSizeImageBlock.style.width = width * zoom + 'px';
            fullSizeImageBlock.style.height = height * zoom + 'px';
        }
    },

    rotateImage: function (component, rotate) {

        let img = component.find('imgContainer').getElement().querySelector('img');
        let fullSizeImageBlock = component.find('fullSizeImageBlock').getElement();

        var rotate = this.calcNewRotate(fullSizeImageBlock, rotate);

        let isRotated = this.checkIsRotated(rotate)

        this.setFullViewImgSize(img, fullSizeImageBlock, isRotated)

        fullSizeImageBlock.style.position = '';

        let oldPosition = fullSizeImageBlock.getBoundingClientRect();

        this.setNewRotate(fullSizeImageBlock, rotate)

        this.setNewPosition(fullSizeImageBlock, oldPosition, isRotated)
    },

    calcNewRotate: function (fullSizeImageBlock, rotate) {
        let newRotate = -90;
        if (fullSizeImageBlock.style.transform) {
            newRotate = this.getOldRotate(fullSizeImageBlock);
            newRotate = parseInt(newRotate) + rotate;
            newRotate = (rotate === -360 || rotate === 360) ? 0 : newRotate;
        }
        return newRotate;
    },

    checkIsRotated: function (rotate) {
        if (!(rotate / 90 % 2)) {
            return false;
        }
        return true
    },

    getOldRotate: function (fullSizeImageBlock) {
        return parseInt(fullSizeImageBlock.style.transform.replace('rotate(', '').replace(')', ''));
    },

    setNewRotate: function (fullSizeImageBlock, rotate) {
        fullSizeImageBlock.style.webkitTransform = 'rotate(' + rotate + 'deg)';
        fullSizeImageBlock.style.MozTransform = 'rotate(' + rotate + 'deg)';
        fullSizeImageBlock.style.msTransform = 'rotate(' + rotate + 'deg)';
        fullSizeImageBlock.style.OTransform = 'rotate(' + rotate + 'deg)';
        fullSizeImageBlock.style.transform = 'rotate(' + rotate + 'deg)';
    },

    setNewPosition: function (fullSizeImageBlock, oldPosition, isRotated) {

        let pos = fullSizeImageBlock.getBoundingClientRect();

        if (!isRotated) {
            fullSizeImageBlock.style.top = pos.top + 'px';
            fullSizeImageBlock.style.left = pos.left + 'px';
            return
        }

        let yNew = oldPosition.top //+ (pos.height - oldPosition.height)/2;
        let xNew = oldPosition.left //- (pos.width - oldPosition.width)/2;

        fullSizeImageBlock.style.top = yNew + 'px';
        fullSizeImageBlock.style.left = xNew + 'px';

        fullSizeImageBlock.style.position = 'absolute';
    },

    clearRotation: function (fullSizeImageBlock) {
        fullSizeImageBlock.style.webkitTransform = '';
        fullSizeImageBlock.style.MozTransform = '';
        fullSizeImageBlock.style.msTransform = '';
        fullSizeImageBlock.style.OTransform = '';
        fullSizeImageBlock.style.transform = '';
    }

})