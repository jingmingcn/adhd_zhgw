var rslice = [];
var fslice = [];
var bslice = [];
function getSliceCamera(plotDivId, view) {//相机位置

    let cameras = {
        "right": {eye: {x: 1.7, y: 0, z: 0},
            up: {x: 0, y: 0, z: 1},
            center: {x: 0, y: 0, z: 0}},
        "front": {eye: {x: 0, y: 1.7, z: 0},
            up: {x: 0, y: 0, z: 1},
            center: {x: 0, y: 0, z: 0}},
        "back": {eye: {x: 0, y: -1.7, z: 0},
            up: {x: 0, y: 0, z: 1},
            center: {x: 0, y: 0, z: 0}},
    };

    return cameras[view];
}

function getSliceLayout(plotDivId, view, blackBg) {

    let camera = getSliceCamera(plotDivId, view);
    let axisConfig = getAxisConfig();

    let height = Math.min($(window).outerHeight() * .23,
        $(window).width() * 2 / 3);
    let width = height * 3 / 2;

    let layout = {
        height: height, width: width,
        margin: {l:0, r:0, b:0, t:0, pad:0},
        hovermode: false,
        paper_bgcolor: blackBg ? '#000': '#fff',
        axis_bgcolor: '#333',
        scene: {
            camera: camera,
            xaxis: axisConfig,
            yaxis: axisConfig,
            zaxis: axisConfig
        }
    };
    return layout;
}

function getSliceConfig() {
    let config = {
        modeBarButtonsToRemove: ["hoverClosest3d"],
        displayLogo: false,
        displayModeBar: false
    };
    return config;
}

// function getOpacity(){
//     let opacity = $("#opacity-range").val();
//     return opacity == 100 ? 1 : opacity / 300;
// }

function makeRSlicePlot(surface, hemisphere, divId, view) {

    decodeHemisphere(connectomeInfo, surface, hemisphere);
    info = connectomeInfo[surface + "_" + hemisphere];
    info["type"] = "mesh3d";
    info["color"] = "#aaaaaa";
    info["opacity"] = getOpacity();
    info['lighting'] = getLighting();
    rslice.push(info);

    let layout = getSliceLayout("brain-right", view, false);

    layout['title'] = {
        text: connectomeInfo['connectome']['title'],
        font: {size: connectomeInfo['connectome']["title_fontsize"],
            color: textColor(connectomeInfo["black_bg"])},
        yref: 'paper',
        y: .9};

    let config = getSliceConfig();

    Plotly.plot(divId, rslice, layout, config);
}

function makeFSlicePlot(surface, hemisphere, divId, view) {

    decodeHemisphere(connectomeInfo, surface, hemisphere);
    info = connectomeInfo[surface + "_" + hemisphere];
    info["type"] = "mesh3d";
    info["color"] = "#aaaaaa";
    info["opacity"] = getOpacity();
    info['lighting'] = getLighting();
    fslice.push(info);

    let layout = getSliceLayout("brain-front", view, false);

    layout['title'] = {
        text: connectomeInfo['connectome']['title'],
        font: {size: connectomeInfo['connectome']["title_fontsize"],
            color: textColor(connectomeInfo["black_bg"])},
        yref: 'paper',
        y: .9};

    let config = getSliceConfig();

    Plotly.plot(divId, fslice, layout, config);
}

function makeBSlicePlot(surface, hemisphere, divId, view) {

    decodeHemisphere(connectomeInfo, surface, hemisphere);
    info = connectomeInfo[surface + "_" + hemisphere];
    info["type"] = "mesh3d";
    info["color"] = "#aaaaaa";
    info["opacity"] = getOpacity();
    info['lighting'] = getLighting();
    bslice.push(info);

    let layout = getSliceLayout("brain-front", view, false);

    layout['title'] = {
        text: connectomeInfo['connectome']['title'],
        font: {size: connectomeInfo['connectome']["title_fontsize"],
            color: textColor(connectomeInfo["black_bg"])},
        yref: 'paper',
        y: .9};

    let config = getSliceConfig();

    Plotly.plot(divId, bslice, layout, config);
}

function addSlicePlot() {

    for (let hemisphere of ["left", "right"]) {
        makeRSlicePlot("pial", hemisphere, "brain-right", "right");
        makeFSlicePlot("pial", hemisphere, "brain-front", "front");
        makeBSlicePlot("pial", hemisphere, "brain-back", "back");
    }

}

function addRConnectome() {

    let info = connectomeInfo["connectome"];
    if (info["markers_only"]){
        addMarkers();
        return;
    }

    for (let attribute of ["con_x", "con_y", "con_z", "con_w"]) {
        if (!(attribute in info)) {
            info[attribute] = Array.from(decodeBase64(
                info["_" + attribute], "float32"));
            // console.log(attribute+":"+info[attribute]);
            for (let i = 2; i < info[attribute].length; i += 3) {
                info[attribute][i] = null;
            }
        }
    }

    Plotly.plot('brain-right', [{
        type: 'scatter3d',
        mode: 'lines+markers',
        x: info["con_x"],
        y: info["con_y"],
        z: info["con_z"],
        opacity: 1,
        line: {
            width: info["line_width"],
            color: info["con_w"],
            colorscale: info["colorscale"],
            cmin: info["cmin"],
            cmax: info["cmax"]
        },
        marker: {
            size: info["marker_size"],
            color: info["con_w"],
            colorscale: [
                [0, '#000000'],
                [1, "#000000"]
            ],
        }
    }]);
}

function addFConnectome() {

    let info = connectomeInfo["connectome"];
    if (info["markers_only"]){
        addMarkers();
        return;
    }

    for (let attribute of ["con_x", "con_y", "con_z", "con_w"]) {
        if (!(attribute in info)) {
            info[attribute] = Array.from(decodeBase64(
                info["_" + attribute], "float32"));
            // console.log(attribute+":"+info[attribute]);
            for (let i = 2; i < info[attribute].length; i += 3) {
                info[attribute][i] = null;
            }
        }
    }

    Plotly.plot('brain-front', [{
        type: 'scatter3d',
        mode: 'lines+markers',
        x: info["con_x"],
        y: info["con_y"],
        z: info["con_z"],
        opacity: 1,
        line: {
            width: info["line_width"],
            color: info["con_w"],
            colorscale: info["colorscale"],
            cmin: info["cmin"],
            cmax: info["cmax"]
        },
        marker: {
            size: info["marker_size"],
            color: info["con_w"],
            colorscale: [
                [0, '#000000'],
                [1, "#000000"]
            ],
        }
    }]);
}

function addBConnectome() {

    let info = connectomeInfo["connectome"];
    if (info["markers_only"]){
        addMarkers();
        return;
    }

    for (let attribute of ["con_x", "con_y", "con_z", "con_w"]) {
        if (!(attribute in info)) {
            info[attribute] = Array.from(decodeBase64(
                info["_" + attribute], "float32"));
            // console.log(attribute+":"+info[attribute]);
            for (let i = 2; i < info[attribute].length; i += 3) {
                info[attribute][i] = null;
            }
        }
    }

    Plotly.plot('brain-back', [{
        type: 'scatter3d',
        mode: 'lines+markers',
        x: info["con_x"],
        y: info["con_y"],
        z: info["con_z"],
        opacity: 1,
        line: {
            width: info["line_width"],
            color: info["con_w"],
            colorscale: info["colorscale"],
            cmin: info["cmin"],
            cmax: info["cmax"]
        },
        marker: {
            size: info["marker_size"],
            color: info["con_w"],
            colorscale: [
                [0, '#000000'],
                [1, "#000000"]
            ],
        }
    }]);
}

function RSurfaceRelayout(){
    return RUpdateLayout("brain-right",  false);
}

function RUpdateLayout(plotDivId, blackBg) {
    let layout = getSliceLayout(
        plotDivId, "right", blackBg);
    Plotly.relayout(plotDivId, layout);
}

function FSurfaceRelayout(){
    return FUpdateLayout("brain-front",  false);
}

function FUpdateLayout(plotDivId, blackBg) {
    let layout = getSliceLayout(
        plotDivId, "front", blackBg);
    Plotly.relayout(plotDivId, layout);
}

function BSurfaceRelayout(){
    return BUpdateLayout("brain-back",  false);
}

function BUpdateLayout(plotDivId, blackBg) {
    let layout = getSliceLayout(
        plotDivId, "back", blackBg);
    Plotly.relayout(plotDivId, layout);
}