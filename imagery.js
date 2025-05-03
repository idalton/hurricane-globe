
/*********************************************************************************************************************
 * This code is taken from Bane Sullivan who posted code online regarding how to instantiate
 * the imageary view models for Cesium without using a token
 * website:  https://blog.banesullivan.com/using-cesiumjs-without-a-cesiumion-token-open-access-tile-providers-a1fa70657319 
 * 
 * slight modifications were made to fit the use case for this project 
 *********************************************************************************************************************/

export default function getCesiumImagery() {
    /* Per Carto's website regarding basemap attribution: https://carto.com/help/working-with-data/attribution/#basemaps */
    let CartoAttribution = 'Map tiles by <a href="https://carto.com">Carto</a>, under CC BY 3.0. Data by <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, under ODbL.'

    var imageryViewModels = [];

    imageryViewModels.push(new Cesium.ProviderViewModel({
        name: 'OpenStreetMap',
        iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
        tooltip: 'OpenStreetMap (OSM) is a collaborative project to create a free editable \
            map of the world.\nhttp://www.openstreetmap.org',
        creationFunction: function() {
            return new Cesium.UrlTemplateImageryProvider({
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                subdomains: 'abc',
                minimumLevel: 0,
                maximumLevel: 19
            });
        }
    }));
    imageryViewModels.push(new Cesium.ProviderViewModel({
        name: 'Positron',
        tooltip: 'CartoDB Positron basemap',
        iconUrl: 'https://a.basemaps.cartocdn.com/light_all/5/15/12.png',
        creationFunction: function() {
            return new Cesium.UrlTemplateImageryProvider({
                url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                credit: CartoAttribution,
                minimumLevel: 0,
                maximumLevel: 18
            });
        }
    }));

    imageryViewModels.push(new Cesium.ProviderViewModel({
        name: 'Dark Matter',
        tooltip: 'CartoDB Dark Matter basemap',
        iconUrl: 'https://a.basemaps.cartocdn.com/rastertiles/dark_all/5/15/12.png',
        creationFunction: function() {
            return new Cesium.UrlTemplateImageryProvider({
                url: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
                credit: CartoAttribution,
                minimumLevel: 0,
                maximumLevel: 18
            });
        }
    }));

    imageryViewModels.push(new Cesium.ProviderViewModel({
        name: 'Voyager',
        tooltip: 'CartoDB Voyager basemap',
        iconUrl: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/5/15/12.png',
        creationFunction: function() {
            return new Cesium.UrlTemplateImageryProvider({
                url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png',
                credit: CartoAttribution,
                minimumLevel: 0,
                maximumLevel: 18
            });
        }
    }));

    imageryViewModels.push(new Cesium.ProviderViewModel({
        name: 'National Map Satellite',
        iconUrl: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/4/6/4',
        creationFunction: function() {
            return new Cesium.UrlTemplateImageryProvider({
                url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
                credit: 'Tile data from <a href="https://basemap.nationalmap.gov/">USGS</a>',
                minimumLevel: 0,
                maximumLevel: 16
            });
        }
    }));

    return imageryViewModels
}