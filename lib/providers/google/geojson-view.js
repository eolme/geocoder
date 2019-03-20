import inherit from "inherit";
import JSPath from "jspath";
import uniqueId from 'lodash-es/uniqueId';

const GoogleGeoJSONView = inherit({
    __constructor(data, options) {
        this._data = data;
        this._options = options || {};
    },
    toJSON() {
        return this._data;
    },
    toGeoJSON() {
        const geoObject = JSPath.apply(".results[0]", this._data)[0];

        const lowerCorner = [
            geoObject.geometry.viewport.southwest.lng,
            geoObject.geometry.viewport.southwest.lat
        ];

        const upperCorner = [
            geoObject.geometry.viewport.northeast.lng,
            geoObject.geometry.viewport.northeast.lat
        ];

        const coordinates = [
            geoObject.geometry.location.lng,
            geoObject.geometry.location.lat
        ];

        if (this._options.coordorder === "latlong") {
            [
                lowerCorner,
                upperCorner,
                coordinates
            ].forEach((c) => {
                c.reverse();
            });
        }
        return {
            id: uniqueId(),
            type: "Feature",
            bbox: [
                lowerCorner,
                upperCorner
            ],
            geometry: {
                type: "Point",
                coordinates: coordinates
            },
            properties: {
                address_components: geoObject.address_components,
                formatted_address: geoObject.formatted_address,
                types: geoObject.types
            }
        };
    }
});

export { GoogleGeoJSONView };
