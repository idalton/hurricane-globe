import getCesiumImagery from "./imagery.js";

/* we are not using a Cesium token on Principle. There are ways around it */
Cesium.Ion.defaultAccessToken = null;

/* a way to get imagery without using a Cesium Token */
var imageryViewModels = getCesiumImagery()

/* want the default view of the globe model to be roughly over the carribbean */
var CarribbeanViewRectangle = Cesium.Rectangle.fromDegrees(180, -5, 30, 45)

Cesium.Camera.DEFAULT_VIEW_RECTANGLE = CarribbeanViewRectangle;
Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

// Initialize the viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProviderViewModels: imageryViewModels,
    selectedImageryProviderViewModel: imageryViewModels[1],
    animation: true,
    timeline: true,
    infoBox: false,
    // selectionIndicator: false,
});

// Remove the Terrain section of the baseLayerPicker, we are not using it
viewer.baseLayerPicker.viewModel.terrainProviderViewModels.removeAll()

/* make the home button a little snappier */
viewer.homeButton.viewModel.duration = 1

viewer.scene.globe.enableRotation = false;



var customHomeView = Cesium.Cartesian3.fromDegrees(-75, 20, 10000000);


/* testing polylines and coloring */ 
var positions = []   

async function polylineExperiments() {

    /* simple polyline */
    viewer.entities.add({
        polyline: {
            positions: [
                // Cesium.Cartographic.fromDegrees(74.02, 42.53),
                // Cesium.Cartographic.fromDegrees(74.02, 38.53),
                Cesium.Cartesian3.fromDegrees(-74.02, 42.53),
                Cesium.Cartesian3.fromDegrees(-74.02, 38.53),
                Cesium.Cartesian3.fromDegrees(-75.02, 39.53),
                Cesium.Cartesian3.fromDegrees(-76.02, 40.53),
                Cesium.Cartesian3.fromDegrees(-77.02, 41.53),
                Cesium.Cartesian3.fromDegrees(-78.02, 42.53),
            ],
            arcType: Cesium.ArcType.GEODESIC,
            width: 10,
            material: Cesium.Color.fromAlpha(Cesium.Color.CYAN, .5),
        }
    });

    

    // Example 1: Draw a polyline with per segment colors
    let lat40positions = [];
    let colors = [];
    let i;
    for (i = 0; i < 12; ++i) {
        lat40positions.push(Cesium.Cartesian3.fromDegrees(-124.0 + 5 * i, 40.0));
        colors.push(Cesium.Color.fromRandom({ alpha: 1.0 }));
    }
    // For per segment coloring, supply the colors option with
    // an array of colors for each segment.
    viewer.scene.primitives.add(
        new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
            positions: lat40positions,
            width: 5.0,
            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
            colors: colors,
            }),
        }),
        appearance: new Cesium.PolylineColorAppearance(),
        }),
    );

    // Example 2: Draw a polyline with per vertex colors
    let lat35positions = [];
    colors = [Cesium.Color.RED, Cesium.Color.RED, Cesium.Color.RED, Cesium.Color.RED, Cesium.Color.RED, Cesium.Color.RED,
            Cesium.Color.BLUE, Cesium.Color.BLUE, Cesium.Color.BLUE, Cesium.Color.BLUE, Cesium.Color.BLUE, Cesium.Color.BLUE];
    for (i = 0; i < 12; ++i) {
        lat35positions.push(Cesium.Cartesian3.fromDegrees(-124.0 + 5 * i, 35.0));
        positions.push(Cesium.Cartesian3.fromDegrees(-124.0 + 5 * i, 35.0));
    }
    // For per segment coloring, supply the colors option with
    // an array of colors for each vertex.  Also set the
    // colorsPerVertex option to true.
    viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
            id: "22",
            geometry: new Cesium.PolylineGeometry({
                
                positions: positions,
            width: 5.0,
            vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
            colors: colors,
            colorsPerVertex: true,
            }),
        }),
        appearance: new Cesium.PolylineColorAppearance(),
        }),
    );

}

// var posprop = []
polylineExperiments();


async function loadModel(modelUri,scale, positionProperty) {
    const modelEntity = viewer.entities.add({
    // availability: new Cesium.TimeIntervalCollection([ new Cesium.TimeInterval({ start: start, stop: stop }) ]),
    availability: new Cesium.TimeIntervalCollection([ new Cesium.TimeInterval({ start: viewer.clock.startTime.clone() , stop: viewer.clock.stopTime.clone() }) ]),
    position: positionProperty,
    model: { 
        uri: modelUri,
        scale: scale 
    },
   // Automatically compute the orientation from the position.
    orientation: new Cesium.VelocityOrientationProperty(positionProperty),    
    // path: new Cesium.PathGraphics({ width: 3 }),
    });

    viewer.trackedEntity = modelEntity;
}



async function loadHurricaneTest() {

    var rawdata = await fetch('./data/ian_test.json');
    const hurricaneData = await rawdata.json();

    console.log(hurricaneData)
    console.log(hurricaneData[0])
    console.log(hurricaneData[hurricaneData.length - 1])
    const startIndex = hurricaneData[0]
    const endIndex = hurricaneData[hurricaneData.length - 1]

    const startTime = Cesium.JulianDate.fromIso8601(startIndex.datetime);
    const stopTime = Cesium.JulianDate.fromIso8601(endIndex.datetime);
    console.log("time!")
    viewer.clock.startTime = startTime.clone();
    viewer.clock.stopTime = stopTime.clone();
    viewer.clock.currentTime = startTime.clone();
    viewer.timeline.zoomTo(startTime, stopTime);
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // Loop at the end
    viewer.clock.multiplier = 10000;
    viewer.clock.shouldAnimate = true;

    // The SampledPositionedProperty stores the position and timestamp for each point along the track.
    const positionProperty = new Cesium.SampledPositionProperty();

    var positions = []
    var colors = []
    const polylines = new Cesium.PolylineCollection();

    for (let i = 0; i < hurricaneData.length; i++) {
        console.log("hurricane Point!")
        const entry = hurricaneData[i];

        // create the time and position for this hurricane data entry.
        const time = Cesium.JulianDate.fromIso8601(entry.datetime);
        const position = Cesium.Cartesian3.fromDegrees(entry.lon, entry.lat);

        // save the position for later
        positions.push(position)

        // get the corresponding color based on the current entry category rating
        var color = getCategoryColorMapping(entry.category)
        colors.push(color)


        // add the time and position to the sampled position property so it can be animated.
        positionProperty.addSample(time, position);

        viewer.entities.add({
            description: `Index ${entry.index}`,
            position: position,
            point: {
                pixelSize: 8,
                color: color
            }
        });

        // attempts to create dashed lines 
        // var dash = new Cesium.PolylineDashMaterialProperty({  color: Cesium.Color.BLACK,})
        // var mat = dash
        // if (i >= 1) {
        //     var prev_entry = hurricaneData[i-1];

        //     if (entry.category == -1 ) {
        //         mat = dash
        //     } else {
        //         mat = color
        //     }

        // viewer.entities.add({
        //     polyline: {positions : Cesium.Cartesian3.fromDegreesArray([
        //             prev_entry.lon, prev_entry.lat,
        //             entry.lon, entry.lat]),
        //         width : 5,
        //         material:  mat}
        // });
        // }
    }


    viewer.scene.primitives.add(
        new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                id: "Hurricane Track Test",
                geometry: new Cesium.PolylineGeometry({
                    positions: positions,
                    width: 5.0,
                    vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
                    colors: colors,
                    colorsPerVertex: true,
                }),
            }),
            appearance: new Cesium.PolylineColorAppearance(),
        }),
    );

    viewer.scene.primitives.add(polylines);

    console.log("test!")

    await loadModel("./models/hurricane_larger_animated_slow_1fps.glb", 800, positionProperty)

    // viewer.clock.onTick.addEventListener(function (clock) {
    //     if (Cesium.JulianDate.greaterThan(clock.currentTime,stopTime)) { // Assuming you have a defined end date
    //         console.log("Stop")
    //         // viewer.clock.canAnimate = false;
    //         viewer.clock.shouldAnimate = false;
    //         viewer.clock.onTick.removeEventListener(this); // Optional: remove the listener after it's used
    //     }
    // });

}

loadHurricaneTest()

/* this color mapping is made from a rough idea of the color coding used in news casts and etc 
    it does appear to me more on the Rairnbow color scale size so... */
const categoryColorMapping = {
    "-1": Cesium.Color.LAWNGREEN,
    "0": Cesium.Color.GREEN,
    "1": Cesium.Color.YELLOW,
    "2": Cesium.Color.ORANGE,
    "3": Cesium.Color.RED,
    "4": Cesium.Color.PURPLE, 
    "5": Cesium.Color.FUCHSIA,
}

/* this color mapping is taken from the wikipedia page for the saffir-simpson scale */
/* less colorful but simpler and probably better for colorblind individuals */
const categoryColorMappingWikipedia = {
    "-1":Cesium.Color.fromCssColorString("#6EC1EA"),
    "0": Cesium.Color.fromCssColorString("#4DFFFF"),
    "1": Cesium.Color.fromCssColorString("#FFFFD9"),
    "2": Cesium.Color.fromCssColorString("#FFD98C"),
    "3": Cesium.Color.fromCssColorString("#FF9E59"),
    "4": Cesium.Color.fromCssColorString("#FF738A"), 
    "5": Cesium.Color.fromCssColorString("#A188FC"),
}

/* function to perform the color lookup TODO: make the color pallete configurable */
function getCategoryColorMapping(category) {
    return categoryColorMapping[category]
    // return categoryColorMappingWikipedia[category]
}
