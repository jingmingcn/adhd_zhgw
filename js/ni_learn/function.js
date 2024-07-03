function decodeBase64(encoded, dtype) {

    let getter = {
        "float32": "getFloat32",
        "int32": "getInt32"
    }[dtype];

    let arrayType = {
        "float32": Float32Array,
        "int32": Int32Array
    }[dtype];

    let raw = atob(encoded);
    let buffer = new ArrayBuffer(raw.length);
    let asIntArray = new Uint8Array(buffer);
    for (let i = 0; i !== raw.length; i++) {
        asIntArray[i] = raw.charCodeAt(i);
    }

    let view = new DataView(buffer);
    let decoded = new arrayType(
        raw.length / arrayType.BYTES_PER_ELEMENT);
    for (let i = 0, off = 0; i !== decoded.length;
        i++, off += arrayType.BYTES_PER_ELEMENT) {
        decoded[i] = view[getter](off, true);
    }
    return decoded;
}

function getAxisConfig() {
    let axisConfig = {
        showgrid: false,
        showline: false,
        ticks: '',
        title: '',
        showticklabels: false,
            zeroline: false,
        showspikes: false,
        spikesides: false
    };

    return axisConfig;
}

function getLighting() {
    return {};
    // i.e. use plotly defaults:
    // {
    //     "ambient": 0.8,
    //     "diffuse": .8,
    //     "fresnel": .2,
    //     "specular": .05,
    //     "roughness": .5,
    //     "facenormalsepsilon": 1e-6,
    //     "vertexnormalsepsilon": 1e-12
    // };

}

function getConfig() {
    let config = {
        modeBarButtonsToRemove: ["hoverClosest3d"],
        displayLogo: false,
    };

    return config;
}

function getCamera(plotDivId, viewSelectId) {
    let view = $("#" + viewSelectId).val();
    if (view === "custom") {
        try {
            return $("#" + plotDivId)[0].layout.scene.camera;
        } catch (e) {
            return {};
        }
    }
    let cameras = {
        "left": {eye: {x: -1.7, y: 0, z: 0},
                    up: {x: 0, y: 0, z: 1},
                    center: {x: 0, y: 0, z: 0}},
        "right": {eye: {x: 1.7, y: 0, z: 0},
                    up: {x: 0, y: 0, z: 1},
                    center: {x: 0, y: 0, z: 0}},
        "top": {eye: {x: 0, y: 0, z: 1.7},
                up: {x: 0, y: 1, z: 0},
                center: {x: 0, y: 0, z: 0}},
        "bottom": {eye: {x: 0, y: 0, z: -1.7},
                    up: {x: 0, y: 1, z: 0},
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

function getLayout(plotDivId, viewSelectId, blackBg) {

    let camera = getCamera(plotDivId, viewSelectId);
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

function updateLayout(plotDivId, viewSelectId, blackBg) {
    let layout = getLayout(
        plotDivId, viewSelectId, blackBg);
    Plotly.relayout(plotDivId, layout);
}

function textColor(black_bg){
    if (black_bg){
        return "white";
    }
    return "black";
}

function addColorbar(colorscale, cmin, cmax, divId, layout, config,
                     fontsize=25, height=.5, color="black") {
    // hack to get a colorbar
    let dummy = {
        "opacity": 0,
        "colorbar": {"tickfont": {"size": fontsize, "color": color},
                     "len": height},
        "type": "mesh3d",
        "colorscale": colorscale,
        "x": [1, 0, 0],
        "y": [0, 1, 0],
        "z": [0, 0, 1],
        "i": [0],
        "j": [1],
        "k": [2],
        "intensity": [0.],
        "cmin": cmin,
        "cmax": cmax,
    };

    Plotly.plot(divId, [dummy], layout, config);

}


function decodeHemisphere(surfaceInfo, surface, hemisphere){

    let info = surfaceInfo[surface + "_" + hemisphere];
    for (let attribute of ["x", "y", "z"]) {
        if (!(attribute in info)) {
            info[attribute] = decodeBase64(
                info["_" + attribute], "float32");
        }
    }

    for (let attribute of ["i", "j", "k"]) {
        if (!(attribute in info)) {
            info[attribute] = decodeBase64(
                info["_" + attribute], "int32");
        }
    }

}
var data = [];

function getOpacity(){
    let opacity = 30;
    return opacity == 100 ? 1 : opacity / 300;
    // return opacity = "0.1";
}

function makePlot(surface, hemisphere, divId) {//绘制3D大脑图

    decodeHemisphere(connectomeInfo, surface, hemisphere);
    info = connectomeInfo[surface + "_" + hemisphere];
    info["type"] = "mesh3d";
    info["color"] = "#aaaaaa";
    info["opacity"] = getOpacity();
    info['lighting'] = getLighting();
    data.push(info);

    let layout = getLayout("connectome-plot", "select-view", false);

    layout['title'] = {
        text: connectomeInfo['connectome']['title'],
        font: {size: connectomeInfo['connectome']["title_fontsize"],
            color: textColor(connectomeInfo["black_bg"])},
        yref: 'paper',
        y: .9};

    let config = getConfig();

    Plotly.plot(divId, data, layout, config);
}

function addPlot() {

    for (let hemisphere of ["left", "right"]) {
        makePlot("pial", hemisphere, "connectome-plot");
    }
    if(connectomeInfo["connectome"]["markers_only"]){
        return;
    }
    if(connectomeInfo["connectome"]["colorbar"]){//从上面数据中获取colorbar信息
        // addColorbar(
        //     connectomeInfo["connectome"]["colorscale"],
        //     connectomeInfo["connectome"]["cmin"],
        //     connectomeInfo["connectome"]["cmax"],
        //     "connectome-plot", getLayout("connectome-plot",
        //         "select-view", false),
        //     getConfig(),
        //     connectomeInfo["connectome"]["cbar_fontsize"],
        //     connectomeInfo["connectome"]["cbar_height"],
        //     textColor(connectomeInfo["black_bg"]));
    }
}

// function updateOpacity() {
//     let opacity = getOpacity();
//     rslice[0]["opacity"]= data[0]["opacity"] = opacity;
//     rslice[1]["opacity"]= data[1]["opacity"] = opacity;
//     bslice[0]["opacity"] = fslice[0]["opacity"] = opacity;
//     bslice[1]["opacity"] = fslice[1]["opacity"] = opacity;
//
//     Plotly.react("connectome-plot", data,
//         getLayout("connectome-plot", "select-view", false),
//         getConfig());
//     Plotly.react("brain-right", rslice,
//         getSliceLayout("brain-right", "right", false),
//         getSliceConfig());
//     Plotly.react("brain-front", fslice,
//         getSliceLayout("brain-front", "front", false),
//         getSliceConfig());
//     Plotly.react("brain-back", bslice,
//         getSliceLayout("brain-back", "back", false),
//         getSliceConfig());
// }

function surfaceRelayout(){
    return updateLayout("connectome-plot", "select-view", false);
}

function addConnectome() {
    let info = connectomeInfo["connectome"];
    if (info["markers_only"]){//数据中只有点就只是画点
        addMarkers();
        return;
    }

    for (let attribute of ["con_x", "con_y", "con_z", "con_w"]) {
        if (!(attribute in info)) {//如果里面没有这几个值，就名字前面加个下斜杠来赋值
            info[attribute] = Array.from(decodeBase64(
                info["_" + attribute], "float32"));
            for (let i = 2; i < info[attribute].length; i += 3) {//每两个插一个空值
                info[attribute][i] = null;
            }
        }
        // console.log(attribute+info[attribute]);
    }

    Plotly.plot('connectome-plot', [{
        type: 'scatter3d',
        mode: 'lines+markers',
        // mode: 'markers',
        x: info["con_x"],
        y: info["con_y"],
        z: info["con_z"],
        opacity: 1,
        // 注释导致只显示点
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

//     var graphDiv = document.getElementById('connectome-plot');
//     graphDiv.on('plotly_click', function(a){
//        console.log(a);
//     });
     }

function addMarkers(){
    let info = connectomeInfo["connectome"];

    for (let attribute of ["con_x", "con_y", "con_z"]) {
        if (!(attribute in info)) {
            info[attribute] = Array.from(decodeBase64(
                info["_" + attribute], "float32"));
        }
    }

    Plotly.plot('connectome-plot', [{
        type: 'scatter3d',
        mode: 'markers',
        x: info["con_x"],
        y: info["con_y"],
        z: info["con_z"],
        opacity: 1,
        marker: {
            size: info["marker_size"],
            color: info["marker_color"],
        }
    }]);
}

