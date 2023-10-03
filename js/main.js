


$(document).ready(function() {
	// Selecciona la barra de navegación específica por su ID o clase
        var navElement = $('#barraNavegacion1');
		navElement.addClass('navbar-top');
    // Detectar el evento de desplazamiento (scroll)
    $(window).scroll(function() {
		// Selecciona la barra de navegación específica por su ID o clase
        var navElement = $('#barraNavegacion1');
        // Verificar la posición de desplazamiento
        if ($(this).scrollTop() > 15) {
            // Si el desplazamiento supera los 100 píxeles, ocultar el elemento
            navElement.addClass('fixed-top');
			navElement.removeClass('navbar-top');
			navElement.addClass('navbar-scrolled');
			
        } else {
            // Si el desplazamiento es menor o igual a 100 píxeles, mostrar el elemento
            navElement.removeClass('fixed-top');
			navElement.addClass('navbar-top');
			navElement.removeClass('navbar-scrolled');
			
        }
    });
});
(function (define) {
    define(function(){

function PerspectiveTransform(element, width, height, useBackFacing){

    this.element = element;
    this.style = element.style;
    this.computedStyle = window.getComputedStyle(element);
    this.width = width;
    this.height = height;
    this.useBackFacing = !!useBackFacing;

    this.topLeft = {x: 0, y: 0};
    this.topRight = {x: width, y: 0};
    this.bottomLeft = {x: 0, y: height};
    this.bottomRight = {x: width, y: height};
}

PerspectiveTransform.useDPRFix = false;
PerspectiveTransform.dpr = 1;

PerspectiveTransform.prototype = (function(){

    var app = {
        stylePrefix: ''
    };

    var _transformStyleName;
    var _transformDomStyleName;
    var _transformOriginDomStyleName;

    var aM = [[0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 0, 1, 0, 0]];
    var bM = [0, 0, 0, 0, 0, 0, 0, 0];

    function _setTransformStyleName(){
        var testStyle = document.createElement('div').style;
        app.stylePrefix =
            'webkitTransform' in testStyle ? 'webkit' :
            'MozTransform' in testStyle ? 'Moz' :
            'msTransform' in testStyle ? 'ms' :
            '';
        _transformStyleName = app.stylePrefix + (app.stylePrefix.length>0?'Transform':'transform');
        _transformOriginDomStyleName = '-'+app.stylePrefix.toLowerCase()+'-transform-origin';
    }


    // Check the distances between each points and if there is some points with the distance lequal to or less than 1 pixel, then return true. Otherwise return false;
    function _hasDistancesError(){
        var lenX = this.topLeft.x - this.topRight.x;
        var lenY = this.topLeft.y - this.topRight.y;
        if(Math.sqrt(lenX * lenX +  lenY * lenY)<=1) return true;
        lenX = this.bottomLeft.x - this.bottomRight.x;
        lenY = this.bottomLeft.y - this.bottomRight.y;
        if(Math.sqrt(lenX * lenX +  lenY * lenY)<=1) return true;
        lenX = this.topLeft.x - this.bottomLeft.x;
        lenY = this.topLeft.y - this.bottomLeft.y;
        if(Math.sqrt(lenX * lenX +  lenY * lenY)<=1) return true;
        lenX = this.topRight.x - this.bottomRight.x;
        lenY = this.topRight.y - this.bottomRight.y;
        if( Math.sqrt(lenX * lenX +  lenY * lenY)<=1) return true;
        lenX = this.topLeft.x - this.bottomRight.x;
        lenY = this.topLeft.y - this.bottomRight.y;
        if( Math.sqrt(lenX * lenX +  lenY * lenY)<=1) return true;
        lenX = this.topRight.x - this.bottomLeft.x;
        lenY = this.topRight.y - this.bottomLeft.y;
        if( Math.sqrt(lenX * lenX +  lenY * lenY)<=1) return true;

        return false;
    }

    // Get the determinant of given 3 points
    function _getDeterminant(p0, p1, p2){
        return p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p0.y * p1.x - p1.y * p2.x - p2.y * p0.x;
    }

    // Return true if it is a concave polygon or if it is backfacing when the useBackFacing property is false. Otehrwise return true;
    function _hasPolyonError(){
        var det1 = _getDeterminant(this.topLeft, this.topRight, this.bottomRight);
        var det2 = _getDeterminant(this.bottomRight, this.bottomLeft, this.topLeft);
        if(this.useBackFacing){
            if(det1*det2<=0) return true;
        }else{
            if(det1<=0||det2<=0) return true;
        }
        var det1 = _getDeterminant(this.topRight, this.bottomRight, this.bottomLeft);
        var det2 = _getDeterminant(this.bottomLeft, this.topLeft, this.topRight);
        if(this.useBackFacing){
            if(det1*det2<=0) return true;
        }else{
            if(det1<=0||det2<=0) return true;
        }
        return false;
    }

    function checkError(){
        if(_hasDistancesError.apply(this)) return 1; // Points are too close to each other.
        if(_hasPolyonError.apply(this)) return 2; // Concave or backfacing if the useBackFacing property is false
        return 0; // no error
    }

    function update() {
        var width = this.width;
        var height = this.height;

        //  get the offset from the transfrom origin of the element
        var offsetX = 0;
        var offsetY = 0;
        var offset = this.computedStyle.getPropertyValue(_transformOriginDomStyleName);
        if(offset.indexOf('px')>-1){
            offset = offset.split('px');
            offsetX = -parseFloat(offset[0]);
            offsetY = -parseFloat(offset[1]);
        }else if(offset.indexOf('%')>-1){
            offset = offset.split('%');
            offsetX = -parseFloat(offset[0]) * width / 100;
            offsetY = -parseFloat(offset[1]) * height / 100;
        }

        //  magic here:
        var dst = [this.topLeft, this.topRight, this.bottomLeft, this.bottomRight];
        var arr = [0, 1, 2, 3, 4, 5, 6, 7];
        for(var i = 0; i < 4; i++) {
            aM[i][0] = aM[i+4][3] = i & 1 ? width + offsetX : offsetX;
            aM[i][1] = aM[i+4][4] = (i > 1 ? height + offsetY : offsetY);
            aM[i][6] = (i & 1 ? -offsetX-width : -offsetX) * (dst[i].x + offsetX);
            aM[i][7] = (i > 1 ? -offsetY-height : -offsetY) * (dst[i].x + offsetX);
            aM[i+4][6] = (i & 1 ? -offsetX-width : -offsetX) * (dst[i].y + offsetY);
            aM[i+4][7] = (i > 1 ? -offsetY-height : -offsetY) * (dst[i].y + offsetY);
            bM[i] = (dst[i].x + offsetX);
            bM[i + 4] = (dst[i].y + offsetY);
            aM[i][2] = aM[i+4][5] = 1;
            aM[i][3] = aM[i][4] = aM[i][5] = aM[i+4][0] = aM[i+4][1] = aM[i+4][2] = 0;
        }
        var kmax, sum;
        var row;
        var col = [];
        var i, j, k, tmp;
        for(var j = 0; j < 8; j++) {
            for(var i = 0; i < 8; i++)  col[i] = aM[i][j];
            for(i = 0; i < 8; i++) {
                row = aM[i];
                kmax = i<j?i:j;
                sum = 0.0;
                for(var k = 0; k < kmax; k++) sum += row[k] * col[k];
                row[j] = col[i] -= sum;
            }
            var p = j;
            for(i = j + 1; i < 8; i++) {
                if(Math.abs(col[i]) > Math.abs(col[p])) p = i;
            }
            if(p != j) {
                for(k = 0; k < 8; k++) {
                    tmp = aM[p][k];
                    aM[p][k] = aM[j][k];
                    aM[j][k] = tmp;
                }
                tmp = arr[p];
                arr[p] = arr[j];
                arr[j] = tmp;
            }
            if(aM[j][j] != 0.0) for(i = j + 1; i < 8; i++) aM[i][j] /= aM[j][j];
        }
        for(i = 0; i < 8; i++) arr[i] = bM[arr[i]];
        for(k = 0; k < 8; k++) {
            for(i = k + 1; i < 8; i++) arr[i] -= arr[k] * aM[i][k];
        }
        for(k = 7; k > -1; k--) {
            arr[k] /= aM[k][k];
            for(i = 0; i < k; i++) arr[i] -= arr[k] * aM[i][k];
        }

        var style = 'matrix3d(' + arr[0].toFixed(9) + ',' + arr[3].toFixed(9) + ', 0,' + arr[6].toFixed(9) + ',' + arr[1].toFixed(9) + ',' + arr[4].toFixed(9) + ', 0,' + arr[7].toFixed(9) + ',0, 0, 1, 0,' + arr[2].toFixed(9) + ',' + arr[5].toFixed(9) + ', 0, 1)';

        //A fix for firefox on retina display, require setting PerspectiveTransform.useDPRFix to true and update the PerspectiveTransform.dpr with the window.devicePixelRatio
        if(PerspectiveTransform.useDPRFix) {
            var dpr = PerspectiveTransform.dpr;
            style = 'scale(' + dpr + ',' + dpr + ')perspective(1000px)' + style + 'translateZ('+ ((1 - dpr) * 1000) + 'px)';
        }

        // use toFixed() just in case the Number became something like 3.10000001234e-9
        return this.style[_transformStyleName] = style;

    }

    _setTransformStyleName();

    app.update = update;
    app.checkError = checkError;

    return app;


})();


        return PerspectiveTransform;
    });
}(typeof define === "function" && define.amd ? define : function (app) {
    window["PerspectiveTransform"] = app();
}));







 const container = document.getElementById("container1");
        const fileInput = document.getElementById("fileInput");

        // Agregamos un manejador de eventos al input de carga de archivos
        fileInput.addEventListener("change", function (e) {
            const file = e.target.files[0];  // Obtenemos el archivo seleccionado

            if (file) {
                const reader = new FileReader();

                // Cuando la lectura del archivo esté completa
                reader.onload = function (e) {
                    // Asigna la imagen cargada como fondo del div
                    container.style.backgroundImage = `url('${e.target.result}')`;
                };

                // Leemos el archivo como una URL de datos (DataURL)
                reader.readAsDataURL(file);
            }
        });
		
		
		var container1 = $("#container2");
            var img = $(".img");
            var pts = $(".pt");
            var IMG_WIDTH = 229;
            var IMG_HEIGHT = 296;
            
    
            var transform = new PerspectiveTransform(img[0], IMG_WIDTH, IMG_HEIGHT, true);
            var tl = pts.filter(".tl").css({
                left : transform.topLeft.x,
                top : transform.topLeft.y
            });
            var tr = pts.filter(".tr").css({
                left : transform.topRight.x,
                top : transform.topRight.y
            });
            var bl = pts.filter(".bl").css({
                left : transform.bottomLeft.x,
                top : transform.bottomLeft.y
            });
            var br = pts.filter(".br").css({
                left : transform.bottomRight.x,
                top : transform.bottomRight.y
            });
            var target;
            var targetPoint;

            function onMouseMove(e) {
                targetPoint.x = e.pageX - container1.offset().left;
                targetPoint.y = e.pageY - container1.offset().top;
                target.css({
                    left : targetPoint.x,
                    top : targetPoint.y
                });
                
                // check the polygon error, if it's 0, which mean there is no error
                if(transform.checkError()==0){
                    transform.update();
                    img.show();
                }else{
                    img.hide();
                }
            }
            
            pts.mousedown(function(e) {
                target = $(this);
                targetPoint = target.hasClass("tl") ? transform.topLeft : target.hasClass("tr") ? transform.topRight : target.hasClass("bl") ? transform.bottomLeft : transform.bottomRight;
                onMouseMove.apply(this, Array.prototype.slice.call(arguments));
                $(window).mousemove(onMouseMove);
                $(window).mouseup(function() {
                    $(window).unbind('mousemove', onMouseMove);
                })
            });