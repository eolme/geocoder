import { BaseGeoCodeProvider } from "../base-geocode-provider";
import { GoogleGeoJSONView } from "./geojson-view";
import inherit from "inherit";

const GoogleGeoCodeProvider = inherit(BaseGeoCodeProvider, {
    __constructor() {
        this.__base.apply(this, arguments);
    },
    process(result) {
        const view = new GeoJSONView(result, this._options);
        return view.toGeoJSON();
    },
    getRequestParams(point) {
        return {
            address: this.getText(point),
            sensor: false
        };
    },
    getRequestUrl() {
        return "http://maps.googleapis.com/maps/api/geocode/json";
    }
});

export { GoogleGeoCodeProvider };
