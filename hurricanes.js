
var hurricaneData = {}
var currentSeason = ""
var previousSeason = ""
var currentHurricaneId = ""
var showAllTracks = true
var trackSelected = false
var viewer = null
var currentTrackPoints = []
const POINT_PIXEL_SIZE = 8
const STORM_MODEL = "./models/hurricane_larger_animated_slow_1fps.glb"
const STORM_MODEL_SCALE = 1000
const STORM_TRACK_REDUCED_OPACITY = .2
const CLOCK_SPEED = 8000
const DATA_FILE = "data/temp.json"
/* Setter functions for global variables needed for the main and this modele of javascript */

export function setCurrentSeason(season){
    previousSeason = currentSeason
    currentSeason = season
    updateHurricaneSelectorOptions()
    updateTracks("")
}
export function setCurrentHurricane(hurricaneid){
    currentHurricaneId = hurricaneid
    previousSeason = currentSeason
    updateTracks(hurricaneid)
}

export function setShowAllTracks(show){
    showAllTracks = show
    //update
}
export function setTrackSelected(show){
    trackSelected = show
    // update
}

export function setViewer(newviewer){
    viewer = newviewer
}



export async function processData() {
    /* get the raw data */ 
    var rawdata = await fetch(DATA_FILE);
    const hurdat2Data = await rawdata.json();
    console.log("Hurricane Data: ", hurdat2Data)
    hurricaneData = hurdat2Data
    /* structure is organized by season */
    /* the goal is produce the hurricane track polyline, points, and animated entity, and save them for later */ 
    for (let season in hurdat2Data) {
        let current_season = hurricaneData[season]
        console.log(season, current_season)
        let seasonStartDate = null
        let seasonEndDate = null
        // let current_data = hurricaneModelTrackData[season]
        for (let hurricane in current_season ) {
            // current_data[hurricane] = {}
            // console.log(hurricane)
            // current_data
            // console.log(current_season[hurricane])
            if (current_season[hurricane].id){
                // current_season[hurricane].id = hurricane
                current_season[hurricane].trackline = createHurricaneTrackLine(current_season[hurricane], 1)
                current_season[hurricane].trackline_low_opacity = createHurricaneTrackLine(current_season[hurricane], STORM_TRACK_REDUCED_OPACITY)
                current_season[hurricane].trackpoints = createHurricaneTrackPoints(current_season[hurricane])
                createStormAnimation(current_season[hurricane])
                // createHurricaneTrackLine(current_season[hurricane])
                // createHurricaneTrackPoints(current_season[hurricane])
                if (!seasonStartDate) 
                if (!seasonStartDate || Cesium.JulianDate.lessThan(current_season[hurricane].startTime, seasonStartDate)) {
                    seasonStartDate = current_season[hurricane].startTime
                }
                if (!seasonEndDate || Cesium.JulianDate.greaterThan(current_season[hurricane].stopTime, seasonEndDate)) {
                    seasonEndDate = current_season[hurricane].stopTime
                }
            }
            
        }
        current_season.startTime = seasonStartDate.clone()
        current_season.stopTime = seasonEndDate.clone()
    }

    // If the mouse is over the billboard, change its scale and color
    /****  an much more complicated than it should be mouse over function ****/

    /* keeps track of previous hovered entities/points */
    let previousentity = null

    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
        /* pick an object that is underneath the mouse */
        const pickedObject = viewer.scene.pick(movement.endPosition);
        let pointfound = false
        /* is the object registered with cesium */
        if (Cesium.defined(pickedObject)) {
            /* iterate through all the currently displayed track points */
            currentTrackPoints.forEach(entity => {
                /* check if the picked object matches any of our point entities */
                if (pickedObject.id === entity) {
                    pointfound = true
                    /* if we found one and we found another one before, reset that one*/
                    if (previousentity) previousentity.point.pixelSize = POINT_PIXEL_SIZE
                    /* make hovered over one bigger */ 
                    entity.point.pixelSize = POINT_PIXEL_SIZE * 2
                    /* save it for later */
                    previousentity = entity
                }
            })
            /* if we found an object but was not a point entity, reset our previous */
            if (!pointfound && previousentity) {
                previousentity.point.pixelSize = POINT_PIXEL_SIZE
                previousentity = null
            
            }
        /* if we didnt find any object, reset our previous */
        } else if (previousentity) {
            previousentity.point.pixelSize = POINT_PIXEL_SIZE
            previousentity = null
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    updateSeasonSelector(Object.keys(hurricaneData))
}

export function updateSeasonSelector(seasonlist) {
    const seasondropdown = document.getElementById("hurricaneSeasonSelector")

    for (let i = 0; i < seasonlist.length ; ++i) {
        const option = document.createElement("option");
        option.value = seasonlist[i];
        option.textContent = seasonlist[i];
        seasondropdown.appendChild(option);
    }
}

export function updateHurricaneSelectorOptions() {
    console.log("Updating Hurricane Selector Options for season:", currentSeason);
    const hurricaneSelector = document.getElementById("hurricaneSelector");
    /* reset the HTML of the selector */
    hurricaneSelector.innerHTML = '<option value="">-- Select Hurricane --</option>';

    // console.log(hurricaneData[currentSeason])
    /* for each storm add the storm designator and name to the selector list */
    for (let id in  hurricaneData[currentSeason]) {
        if (hurricaneData[currentSeason][id].id) {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = id + " : " + hurricaneData[currentSeason][id].name;
            hurricaneSelector.appendChild(option);
        }
    }

    const seasonSummary = document.getElementById("summary-box");
    seasonSummary.innerHTML = hurricaneData[currentSeason].summary;

}





export function updateTracks(selectedHurricaneId) {
    console.log ("Updating displayed tracks for season ", currentSeason)
    // viewer.scene.primitives.removeAll()
    clearSeason(previousSeason)
    let pointparent = null
    for (let id in  hurricaneData[currentSeason]) {
        let hurricane = hurricaneData[currentSeason][id]
        console.log("updating for hurricane", hurricane)
        if (hurricane.id){
            
            if (selectedHurricaneId == "") {
                viewer.scene.primitives.add(hurricane.trackline)
                hurricane.pointsparent.show = true
                currentTrackPoints.push(...hurricane.trackpoints)
                hurricane.stormModelEntity.show = true
            } else {
                pointparent = hurricane.pointsparent
                console.log("current selected hurricane ID: ", selectedHurricaneId)
                if (hurricane.id == selectedHurricaneId) {
                    viewer.scene.primitives.add(hurricane.trackline)
                    hurricane.pointsparent.show = true
                    currentTrackPoints.push(...hurricane.trackpoints)
                    hurricane.stormModelEntity.show = true
                } else {
                    // reduceTrackOpacity(hurricane.trackline)
                    viewer.scene.primitives.add(hurricane.trackline_low_opacity)
                    // hurricane.pointsparent.show = true
                    // currentTrackPoints.push(...hurricane.trackpoints)
                    // hurricane.stormModelEntity.show = true
                }
                
            }

            
        }
        
    }
        
    if (selectedHurricaneId == "") {
        let startTime = hurricaneData[currentSeason].startTime
        let stopTime = hurricaneData[currentSeason].stopTime
        viewer.clock.startTime = startTime.clone();
        viewer.clock.stopTime = stopTime.clone();
        viewer.clock.currentTime = startTime.clone();
        viewer.timeline.zoomTo(startTime, stopTime);
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // Loop at the end
        viewer.clock.multiplier = CLOCK_SPEED ;
        viewer.clock.shouldAnimate = true;
    } else {
        let startTime = hurricaneData[currentSeason][selectedHurricaneId].startTime
        let stopTime = hurricaneData[currentSeason][selectedHurricaneId].stopTime
        viewer.clock.startTime = startTime.clone();
        viewer.clock.stopTime = stopTime.clone();
        viewer.clock.currentTime = startTime.clone();
        viewer.timeline.zoomTo(startTime, stopTime);
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // Loop at the end
        viewer.clock.multiplier = CLOCK_SPEED ;
        viewer.clock.shouldAnimate = true;
        
    }

    if (selectedHurricaneId != "") {
        // viewer.scene.camera.flyTo(viewer.entities)
        console.log("flying to entities")
        viewer.flyTo( viewer.entities )
    //     // console.log(pointparent)
    //     // console.log(Cesium.DataSourceDisplay.getBoundingSphere(pointparent)) 
    }
    
}


// function reduceTrackOpacity(trackline){
//     for (let i= 0; i < trackline.geometrycolr
// }


function clearSeason(season) {
    console.log("removing season from display: ", season)
    if (season == "") return

    currentTrackPoints = []
    currentHurricaneId = ""

    console.log(hurricaneData[season])
    /* for each storm id get the storm and perform operations to clear its items on the screen */
    for (let id in hurricaneData[season]) {
        let storm = hurricaneData[season][id]
        
        if (storm.id) {
            storm.pointsparent.show = false
            /* the tracklines are cesium primitives which need to be manually removed */
            viewer.scene.primitives.remove(storm.trackline)
            viewer.scene.primitives.remove(storm.trackline_low_opacity)
            storm.stormModelEntity.show = false
        }
        /* the point entities are assigned a parent that can be conviently turned off */
    }
}



function createHurricaneTrackLine(hurricane, opacity) {
    console.log("creating a trackline for hurricane: ", hurricane)
    var positions = []
    var colors = []
    // console.log("Object entries:", Object.entries(hurricane.entries) )
    // console.log("entries", hurricane.entries)
    // console.log("entries", typeof hurricane.entries)
    hurricane.entries.forEach(entry =>  {
        positions.push (Cesium.Cartesian3.fromDegrees(entry.lon, entry.lat))

        colors.push( getCategoryColorMapping(entry.category,opacity))
        
    });

    var appearance = new Cesium.PolylineColorAppearance()
    // appearance.renderState.depthTest.enabled = false 
    var trackline = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            id: hurricane.name + "track",
            geometry: new Cesium.PolylineGeometry({
                positions: positions,
                width: 5.0,
                vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
                colors: colors,
                colorsPerVertex: true,
                
            }),
        }),
        // appearance: new Cesium.PolylineColorAppearance(),
        appearance: appearance,
    });

    return trackline
}


function createHurricaneTrackPoints(hurricane){
    console.log("creating trackpoints for hurricane: ", hurricane)

    const parent = new Cesium.Entity({
        id: "parentId",
        show : false
    });



    const trackpoints = []
    hurricane.entries.forEach(entry =>  {
        const position = Cesium.Cartesian3.fromDegrees(entry.lon, entry.lat);
        const color = getCategoryColorMapping(entry.category)
        var str = hurricane.id +" - " + hurricane.name
        console.log(str)
        var point = {
            name: str,
            description: getStormPointEntryDescription(entry),
            position: position,
            parent: parent,
            viewFrom: new Cesium.Cartesian3(0,0,100000),
            point: {
                pixelSize: 10,
                color: color,
                // outlineWidth: 1,
                // disableDepthTestDistance: Number.POSITIVE_INFINITY, // always show the point over things
                // disableDepthTestDistance: 100000000
            },
        }
        /* add the point to the viewers entities */ 
        var pointentity =  viewer.entities.add(point)
        /* save the point object for later */
        
        // trackpoints.push (point);  
        trackpoints.push (pointentity);  
    });

    function getStormPointEntryDescription(entry) {
        const date = new Date(entry.datetime);
        return `
            <table class="storm-entry-description" border="1" cellpadding="4" cellspacing="0">
                <tr>
                    <th style="text-align: left;">Date</th>
                    <td>${date.toUTCString()}</td>
                </tr>
                <tr>
                    <th>Pressure</th>
                    <td>${entry.pressure} mb</td>
                </tr>
            </table>
        `;
    }
    

    hurricane.pointsparent = parent
    return trackpoints
}




function createStormAnimation(hurricane) {
    console.log("creating storm animation for hurricane: ", hurricane)
    // The SampledPositionedProperty stores the position and timestamp for each point along the track.
    const positionProperty = new Cesium.SampledPositionProperty();
    var entries = hurricane.entries

    const startIndex = entries[0]
    const endIndex = entries[entries.length - 1]

    const startTime = Cesium.JulianDate.fromIso8601(startIndex.datetime);
    const stopTime = Cesium.JulianDate.fromIso8601(endIndex.datetime);
    hurricane.startTime = startTime
    hurricane.stopTime = stopTime

    entries.forEach( entry => {
        // create the time and position for this hurricane data entry.
        const time = Cesium.JulianDate.fromIso8601(entry.datetime);
        const position = Cesium.Cartesian3.fromDegrees(entry.lon, entry.lat);

        // add the time and position to the sampled position property so it can be animated.
        positionProperty.addSample(time, position);
    })

    const modelEntity = viewer.entities.add({
        // availability: new Cesium.TimeIntervalCollection([ new Cesium.TimeInterval({ start: start, stop: stop }) ]),
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
            start: startTime,
            stop: stopTime
        })]),
        position: positionProperty,
        model: {
            uri: STORM_MODEL,
            scale: STORM_MODEL_SCALE
        },
        // Automatically compute the orientation from the position.
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        show: false,
        name: hurricane.id +" - " + hurricane.name,
        description: hurricane.info,
        label: {
            text: hurricane.name,
            outlineWidth: 2,
            outlineColor: Cesium.Color.BLACK,
            pixelOffset: new Cesium.Cartesian2(0,-20),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            disableDepthTestDistance: Number.POSITIVE_INFINITY, // always show the point over things

        }
        
    });
    hurricane.stormModelEntity = modelEntity
}





/* this color mapping is made from a rough idea of the color coding used in news casts and etc 
    it does appear to me more on the Rairnbow color scale size so... */
const categoryColorMappingStandard = {
    "-1": Cesium.Color.LAWNGREEN,
    "0": Cesium.Color.GREEN,
    "1": Cesium.Color.YELLOW,
    "2": Cesium.Color.ORANGE,
    "3": Cesium.Color.RED,
    "4": Cesium.Color.PURPLE, 
    "5": Cesium.Color.FUCHSIA,
}

/* this color mapping is taken from the wikipedia page for the saffir-simpson scale */
/* less colorful but simpler and probably better */
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
function getCategoryColorMapping(category, opacity) {
    // return categoryColorMappingStandard[category]
    // return categoryColorMappingWikipedia[category]
    return Cesium.Color.fromAlpha(categoryColorMappingStandard[category], opacity)
}
