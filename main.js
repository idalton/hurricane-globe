import getCesiumImagery from "./imagery.js";
import {
    processData,
    updateHurricaneSelectorOptions,
    setShowAllTracks,
    setCurrentSeason,
    setCurrentHurricane,
    updateTracks,
    setViewer
} from "./hurricanes.js";
// import OpenStreetMapNominatimGeocoder from "./geocoder.js";


/***************************** CESIUM SETUP CODE ***********************************************/ 
/* we are not using a Cesium token on principle. There are ways around it */
Cesium.Ion.defaultAccessToken = null;

/* a way to get tile imagery data without using a Cesium Token */
var imageryViewModels = getCesiumImagery()

/* want the default view of the globe model to be roughly over the carribbean */
var CarribbeanViewRectangle = Cesium.Rectangle.fromDegrees(180, -5, 30, 45)

Cesium.Camera.DEFAULT_VIEW_RECTANGLE = CarribbeanViewRectangle;
Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
/* Initialize the viewer */
const viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProviderViewModels: imageryViewModels,
    selectedImageryProviderViewModel: imageryViewModels[1],
    animation: true,
    timeline: true,
    infoBox: false,
    geocoder: false, //TODO: fix geocoder
    // geocoder: new OpenStreetMapNominatimGeocoder(),
    // selectionIndicator: false,
});



// Remove the Terrain section of the baseLayerPicker, we are not using it
viewer.baseLayerPicker.viewModel.terrainProviderViewModels.removeAll()

/* make the home button a little snappier */
viewer.homeButton.viewModel.duration = 1

/* the application is reusing primitives and entites so we do not want to destroy them */
viewer.scene.primitives.destroyPrimitives = false

/* version of the home view that uses a corrdinate and height as opposed to bounding rectangle */
var customHomeView = Cesium.Cartesian3.fromDegrees(-75, 20, 10000000);


/***************************** Polyline Experiments ********************************************/ 

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

/*********************** Primary data load kickoff function *************************************/
setViewer(viewer)

await processData()

/************************* custom menu options functions ****************************************/

function onSelectSeason(season) {
    console.log("Selected season:", season);
    setCurrentSeason(season)
    
    // Load season track data into Cesium
    // loadSeasonTracks(season);
}

function onSelectHurricane(name) {
    console.log("Selected hurricane:", name);

    // loadHurricaneData(name);
}


function toggleShowAllTracks(show) {
    console.log("Show all season tracks:", show);
    setShowAllTracks(show)
    // updateShowAllTracks(show)
    
}

function toggleTrackSelected(track) {
    console.log("Track selected hurricane:", track);
    // set tracking etc.
}




/* expose some elements to the window for console debugging */
window.viewer = viewer
/* expose the menu options functions so that the html can use them */
window.onSelectSeason = onSelectSeason
window.onSelectHurricane = onSelectHurricane
window.toggleShowAllTracks = toggleShowAllTracks
window.toggleTrackSelected = toggleTrackSelected