/**
 * Created by ctuser on 08.01.2019.
 */
({

    showImageZoomer: function (component, event, helper) {
        event.stopPropagation()

        let zoom;
        let img = component.find('imgContainer').getElement().querySelector('img')
        let lensSize = component.get('v.lensSize').replace('px', '');

        //set minimum zoom

        let validateZoom = function (value) {
            if (value < parseInt(lensSize)) {
                zoom = lensSize / value;
                console.log(lensSize);
            }
        }

        if (img.height < img.width) {
            validateZoom(img.height)
        } else {
            validateZoom(img.width);
        }

        if (zoom) {
            component.set('v.zoom', zoom);
        }

        //set lens position

        setTimeout($A.getCallback(() => {
            helper.setLensPosition(component, event)
        }))
        component.set('v.showLens', true);
    },

    hideImageZoomer: function (component, event, helper) {
        component.set('v.showLens', false);
    },

    onmousemove: function (component, event, helper) {
        if (component.get('v.showLens')) {
            helper.setLensPosition(component, event)
        }
    },

    changeZoomValue: function (component, event, helper) {

        if (!component.get('v.showLens')) {
            return
        }

        event.preventDefault();

        let img = component.find('imgContainer').getElement().querySelector('img')
        let lensSize = component.get('v.lensSize').replace('px', '');

        var zoom = component.get('v.zoom');

        var delta = event.deltaY || event.detail || event.wheelDelta;

        if (event.ctrlKey == true) { //change lens size
            lensSize = parseInt(lensSize) - delta / 10;
            if (lensSize < 150 || lensSize > img.offsetWidth * zoom || lensSize > img.offsetHeight * zoom) {
                return
            }
            component.set('v.lensSize', lensSize + 'px')

        } else { //simple wheel scrolling - change zoom

            zoom -= delta / 250;

            if (1 > img.offsetHeight * zoom / lensSize || 1 > img.offsetWidth * zoom / lensSize) {
                return
            }

            component.set('v.zoom', zoom);
        }

        setTimeout($A.getCallback(() => {
            helper.setLensPosition(component, event)
        }))
    },

    showFullScreenMode: function (component, event, helper) {

        component.set('v.showLens', false);

        let modal = component.find('modalWindow').getElement();
        modal.classList.remove('slds-hide')

        let img = component.find('imgContainer').getElement().querySelector('img');
        let fullSizeImageBlock = component.find('fullSizeImageBlock').getElement();

        //set div and backgroundImage size

        fullSizeImageBlock.style.backgroundImage = 'url(' + img.src + ')';
        fullSizeImageBlock.style.backgroundRepeat = 'no-repeat';

        helper.setFullViewImgSize(img, fullSizeImageBlock, false)
        helper.setNewPosition(fullSizeImageBlock, null, false)

        fullSizeImageBlock.style.position = 'absolute';
    },

    closeFullScreenMode: function (component, event, helper) {
        event.stopPropagation()

        let fullSizeImageBlock = component.find('fullSizeImageBlock').getElement();

        fullSizeImageBlock.style.width = '0px';
        fullSizeImageBlock.style.height = '0px';
        fullSizeImageBlock.style.backgroundImage = '';
        fullSizeImageBlock.style.position = '';
        fullSizeImageBlock.style.top = '';
        fullSizeImageBlock.style.left = '';

        helper.clearRotation(fullSizeImageBlock);

        let modal = component.find('modalWindow').getElement();
        modal.classList.add('slds-hide')

        helper.zoom = 1
    },

    stopPropagation: function (component, event, helper) {
        event.stopPropagation()
    },

    rotateRight: function (component, event, helper) {
        event.stopPropagation()
        helper.rotateImage(component, 90)
    },

    rotateLeft: function (component, event, helper) {
        event.stopPropagation()
        helper.rotateImage(component, -90)
    },

    preventDefault: function (component, event, helper) {
        event.preventDefault()
    },

    wheelZoom: function (component, event, helper) {

        event.preventDefault();

        let getPxls = function (value) {
            return parseFloat(value.replace('px', ''))
        }

        let fullSizeImageBlock = component.find('fullSizeImageBlock').getElement();
        let img = component.find('imgContainer').getElement().querySelector('img');

        let oldHeight = getPxls(fullSizeImageBlock.style.height);
        let oldWidth = getPxls(fullSizeImageBlock.style.width);
        let oldTop = event.pageY - getPxls(fullSizeImageBlock.style.top) - window.pageYOffset;
        let oldLeft = event.pageX - getPxls(fullSizeImageBlock.style.left) - window.pageXOffset;

        var delta = event.deltaY || event.detail || event.wheelDelta;

        if (helper.zoom <= delta / 500) {
            return
        }

        helper.zoom -= delta / 500

        let rotate;

        if (fullSizeImageBlock.style.transform) {
            rotate = fullSizeImageBlock.style.transform.replace('px')
        }

        let isRotated = helper.checkIsRotated(rotate);

        helper.setFullViewImgSize(img, fullSizeImageBlock, isRotated, helper.zoom)

        let top = event.pageY - window.pageYOffset - (oldTop*getPxls(fullSizeImageBlock.style.height)/oldHeight);
        let left = event.pageX - window.pageXOffset - (oldLeft*getPxls(fullSizeImageBlock.style.width)/oldWidth);

        fullSizeImageBlock.style.top = top + 'px'// - event.clientY/helper.zoom + 'px'
        fullSizeImageBlock.style.left = left + 'px'// - event.clientX/helper.zoom + 'px'
    },

    startMoving: function (component, event, helper) {

        event.stopPropagation()
        event.preventDefault()

        let x, y

        let fullSizeImageBlock = component.find('fullSizeImageBlock').getElement();

        if (!fullSizeImageBlock.style.top || !fullSizeImageBlock.style.left) {
            let pos = fullSizeImageBlock.getBoundingClientRect();

            y = pos.top;
            x = pos.left;

            fullSizeImageBlock.style.top = y + 'px';
            fullSizeImageBlock.style.left = x + 'px';
        }

        else {
            y = parseFloat(fullSizeImageBlock.style.top.replace('px', ''))
            x = parseFloat(fullSizeImageBlock.style.left.replace('px', ''))
        }

        fullSizeImageBlock.style.position = 'absolute';


        document.body.onmousemove = (e) => {

            console.log(y + (e.pageY - event.pageY) + 'px')
            console.log(x + (e.pageX - event.pageX) + 'px')
            fullSizeImageBlock.style.top = (y + (e.pageY - event.pageY)) + 'px'
            fullSizeImageBlock.style.left = (x + (e.pageX - event.pageX)) + 'px'
        }

        document.body.onmouseup = () => {
            document.body.onmousemove = null
            document.body.onmouseup = null
        }

        document.body.onmouseleave = () => {
            document.body.onmouseleave = null
            document.body.onmousemove = null
            document.body.onmouseup = null
        }
    },

})