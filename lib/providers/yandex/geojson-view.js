import inherit from "inherit";
import JSPath from "jspath";
import uniqueId from 'lodash-es/uniqueId';

const YandexGeoJSONView = inherit({
    __constructor(data, options) {
        this._data = data;
        this._options = options || {};
    },
    toJSON() {
        return this._data;
    },
    toGeoJSON() {
        const geoObject = JSPath.apply(".response.GeoObjectCollection.featureMember[0].GeoObject", this._data)[0];

        const lowerCorner = geoObject.boundedBy.Envelope.lowerCorner.split(" ").map(Number),
            upperCorner = geoObject.boundedBy.Envelope.upperCorner.split(" ").map(Number),
            coordinates = geoObject.Point.pos.split(" ").map(Number);

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
                name: geoObject.name,
                description: geoObject.description,
                metaDataProperty: geoObject.metaDataProperty
            }
        };
    }
});

export { YandexGeoJSONView };
