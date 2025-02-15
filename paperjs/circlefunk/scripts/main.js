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
        CANVAS_BACKGROUND_COLOR:"#EEEEEE",

        CANVAS_WIDTH: 640,
        CANVAS_HEIGHT: 640, //16:9 aspect ratio
        SCALE_CANVAS: false,
        TEMPLATE: null,
        ANIMATE: true,
        ALLOW_TEMPLATE_SKEW: false,
        POINT_COUNT:30,
        THETA_STEP:5,
        RADIUS_STEP: 1,
        FILL_COLOR:"pink",
        STROKE_COLOR:"white"
    };
    
    /*********** Override Config defaults here ******************/
    
    //config.CANVAS_WIDTH = 1280;
    //config.CANVAS_HEIGHT = 1280;
    
    /*************** End Config Override **********************/
  
    var t; //paperjs tool reference
    var bounds;
    var pixelData;

    var theta = 0;
    var radius = 100;


    var pixelData;
    var main = function(){

        if(config.ANIMATE) {
            view.onFrame = onFrame;
        }
    };

    var onFrame = function(event) {
        //theta += (Math.PI * 2) / 2;
        //radius -= (Math.PI * 2) / 2;

        theta += config.THETA_STEP;
        radius -= config.RADIUS_STEP;

        if(radius <= 0) {
            return;
        }

        var p = Utils.pointOnCircle(bounds.center, radius, theta);

        var points = Utils.randomPointsInCircle(p, radius, config.POINT_COUNT);

        var polygonPoints = Utils.findConvexHull(points);

        var center = Utils.findCentroidOfPolygon(polygonPoints);


        var path = new Path({
            segments: [...polygonPoints],
            closed:true,
            fillColor:pixelData.getHex(center),
            strokeColor:config.STROKE_COLOR,
            blendMode:"normal"
        });

        path.smooth(true);


        //var c = new Path.Circle(p, radius);
        //c.strokeColor = "white";
        //c.opacity = 0.2;
    };

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

        var pdl = new PixelDataLoader(config.CANVAS_WIDTH, config.CANVAS_HEIGHT);

        pdl.load("../_templates/gradients/gradient_11.jpg",
            function(_pd) {
                pixelData = _pd;
                main();
            }
        );
    };

}());