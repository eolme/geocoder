const BaseGeoCodeProvider = require("../base-geocode-provider"),
    GeoJSONView = require("./geojson-view"),
    inherit = require("inherit");

const YandexGeoCodeProvider = inherit(BaseGeoCodeProvider, {
    __constructor() {
        this.__base.apply(this, arguments);
    },
    process(result) {
        const view = new GeoJSONView(result, this._options);
        return view.toGeoJSON();
    },
    getRequestParams(point) {
        const options = this._options;

        const result = {
            geocode: this.getText(point),
            format: "json",
            results: "1"
        };

        if (options.sco === "latlong" || options.coordorder === "latlong") {
            result.sco = "latlong";
        }

        return result;
    },
    getRequestUrl() {
        return "https://geocode-maps.yandex.ru/1.x/";
    }
});

export { YandexGeoCodeProvider };
