/*jslint vars: true, nomen: true, plusplus: true, continue:true, forin:true */
/*global paper, ColorTheme, Point, view, Shape, Path, atob, btoa, ArrayBuffer,
    Uint8Array, Blob, Size, PixelData, Tool, project, Layer, ObjectPool, BlendModes,
    FileDownloader, Utils, MathUtils */

(function () {
    "use strict";
    
    paper.install(window);
    

    var config = {
        APP_NAME: window.location.pathname.replace(/\//gi, ""),
        BACKGROUND_COLOR: "#FFFFFF",
        CANVAS_BACKGROUND_COLOR:"#111111",

        CANVAS_WIDTH: 640,
        CANVAS_HEIGHT: 640, //16:9 aspect ratio
        SCALE_CANVAS: false,
        TEMPLATE: null,
        ANIMATE: true,
        ALLOW_TEMPLATE_SKEW: false,
        MIN_SIZE: 2
    };
    
    /*********** Override Config defaults here ******************/
    
    //config.CANVAS_WIDTH = 1280;
    //config.CANVAS_HEIGHT = 1280;
    
    /*************** End Config Override **********************/
  
    var t; //paperjs tool reference
    var bounds;
    var pixelData;
    let mousePos = new Point();

    var main = function(){
        
        t.onMouseMove = onMouseMove;

        if(config.ANIMATE) {
            view.onFrame = onFrame;
        }
    };

    var onFrame = function(event) {

        project.clear();

        let stepX = mousePos.x + config.MIN_SIZE;
        let stepY = mousePos.y + config.MIN_SIZE;

        if(stepX < 0) {
            stepX = config.MIN_SIZE;
        }

        if(stepY < 0) {
            stepY = config.MIN_SIZE;
        }

        let s = new Size(stepX, stepY);

        for(let gridY = 0; gridY < config.CANVAS_HEIGHT; gridY += stepY) {
            for(let gridX = 0; gridX < config.CANVAS_WIDTH; gridX += stepX){
                let r = new Path.Rectangle(new Point(gridX, gridY),s);
                
                r.fillColor = new Color({
                    hue:(gridX / config.CANVAS_WIDTH) * 360,
                    saturation:(config.CANVAS_HEIGHT - gridY) / config.CANVAS_HEIGHT,
                    brightness:1
                });
            }
        }
    };

    var onMouseMove = function(event) {
        mousePos = event.point; 
    }

    /*********************** init code ************************/

    var initCanvas = function () {
        var drawCanvas = document.getElementById("myCanvas");
        var canvasW = config.CANVAS_WIDTH;
        var canvasH = config.CANVAS_HEIGHT;
        
        if (config.SCALE_CANVAS) {
            var maxW = window.innerWidth;
            var maxH = window.innerHeight;

            //http://www.ajaxblender.com/howto-resize-image-proportionally-using-javascript.html
            if (canvasH > maxH ||
                    canvasW > maxW) {

                var ratio = canvasH / canvasW;

                if (canvasW >= maxW && ratio <= 1) {
                    canvasW = maxW;
                    canvasH = canvasW * ratio;
                } else if (canvasH >= maxH) {
                    canvasH = maxH;
                    canvasW = canvasH / ratio;
                }
            }
        }
        
        drawCanvas.height = canvasH;
        drawCanvas.width = canvasW;

        //this might be redundant
        //paper.view.viewSize.height = canvasH;
        //paper.view.viewSize.width = canvasW;
        
        return drawCanvas;
    };

    var fileDownloader;
    window.onload = function () {

        fileDownloader = new FileDownloader(config.APP_NAME);

        var drawCanvas = initCanvas();
        
        paper.setup(drawCanvas);
        
        var backgroundLayer = project.activeLayer;

        //programtically set the background colors so we can set it once in a var.
        document.body.style.background = config.BACKGROUND_COLOR;
        drawCanvas.style.background = config.CANVAS_BACKGROUND_COLOR;
        
        bounds = view.bounds;

        var rect = new Path.Rectangle(bounds);
        
        rect.fillColor = config.CANVAS_BACKGROUND_COLOR;
    
        t = new Tool();

        //Listen for SHIFT-p to save content as SVG file.
        //Listen for SHIFT-o to save as PNG
        t.onKeyUp = function (event) {
            if (event.character === "S") {
                fileDownloader.downloadSVGFromProject(paper.project);
            } else if (event.character === "P") {
                fileDownloader.downloadImageFromCanvas(drawCanvas);
            } else if (event.character === "J") {
                fileDownloader.downloadConfig(config);
            }
        };

        main();
    };

}());