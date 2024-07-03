//3d大脑区域绘制和交互
var tn='4',
    pn,
    sizes=[],//这样来只改一个点
    colors=[];
let info = connectomeInfo["connectome"];
for (let attribute of ["con_x", "con_y", "con_z", "con_w"]) {
    if (!(attribute in info)) {
        info[attribute] = Array.from(decodeBase64(
            info["_" + attribute], "float32"));
        for (let i = 2; i < info[attribute].length; i += 3) {
            info[attribute][i] = null;
        }
    }
}

function nodeselect (state, name){
    // a("2");
    if (state === true){
        var names = afqb.plots.tracts.map(function(name) {
            return afqb.global.formatKeyName(name);
        });
        var index = names.indexOf(name);
        var color = afqb.global.d3colors[parseInt(index)];
        d3.select("#area-"+name)
            .attr("fill", color);
    } else {
        d3.select("#area-"+name).attr("fill", "null");
    }

}

function allareaselect() {
    for(let i=0;i<54;i++){
        colors[i]="#000000";
        sizes[i]=7;
    }
    colors[36] = 'rgb(196, 156, 148)';
    colors[42] = '#F7B6D2';
    colors[51] = '#FF9896';
    sizes[36]=20;
    sizes[42]=20;
    sizes[51]=20;

    var update = {'marker':{color: colors,size:sizes,colorscale: [
                [0, '#000000'],
                [1, "#000000"]
            ]}};
    Plotly.restyle('connectome-plot', update, [tn]);
    Plotly.restyle('brain-right', update, 4);
    Plotly.restyle('brain-front', update, 4);
    Plotly.restyle('brain-back', update, 4);
}

function areaselect(state,name){
    var cing = $("#area-cingulum_mid_l").attr("fill");
    var ins = $("#area-vermis_3").attr("fill");
    var tem = $("#area-cuneus_r").attr("fill");
    if(state===true){
        switch(name){
            case 'vermis_3':
                if(cing!=="null"||tem!=="null"){
                    // if(cing!=="null"&&tem==="null"){
                    //     dbselect(36,42);
                    // }
                    // else if (tem!=="null"&&cing==="null"){
                    //     dbselect(36,51);
                    // }
                    // else
                    //     allareaselect();
                    pn=82;//ver3 adhd82  tdc82
                    colors[pn] = 'rgb(106, 161, 250)';
                    select(pn);
                }else{
                    pn=82;//ver3 adhd82  tdc82
                    colors[pn] = 'rgb(106, 161, 250)';
                    select(pn);
                }
                break;
            // case 'cingulum_mid_l':
            //     if(ins!=="null"||tem!=="null"){
            //         if(ins!=="null"&&tem==="null"){
            //             dbselect(36,42);
            //         }
            //         else if (tem!=="null"&&ins==="null"){
            //             dbselect(36,51);
            //         }
            //         else
            //             allareaselect();
            //     }else{
            //         pn=42;
            //         colors[pn] = '#F7B6D2';
            //         select(pn);
            //     }
            //     break;
            // case 'cuneus_r':
            //     if(ins!=="null"||cing!=="null"){
            //         if(ins!=="null"&&cing==="null"){
            //             dbselect(36,42);
            //         }
            //         else if (cing!=="null"&&ins==="null"){
            //             dbselect(36,51);
            //         }
            //         else
            //             allareaselect();
            //     }else{
            //         pn=6;
            //         colors[pn] = '#FF9896';
            //         select(pn);
            //     }
            //     break;
            // default :return;
        }
    }
    else{
        if(cing==="null"&&tem==="null"&&ins==="null")
            recover();
        else if(cing==="null"&&tem!=="null"&&ins!=="null")
            dbselect(36,51);
        else if(cing!=="null"&&tem==="null"&&ins!=="null")
            dbselect(36,42);
        else if(cing!=="null"&&tem!=="null"&&ins==="null")
            dbselect(51,42);
        else if(cing!=="null"&&tem==="null"&&ins==="null")
            select(42);
        else if(cing==="null"&&tem!=="null"&&ins==="null")
            select(51);
        else
            select(36);
    }

}

function select(pn){
    // colors[pn]="rgb(106, 161, 250)";
    //asd
    colors[pn]="#6AA1FA";//#FFBB78FF
    for(let i=0;i<116;i++){
        if(i!==pn){
            colors[i]="#000000";
            sizes[i]=7;
        }
    }
    sizes[pn]=20;

    var update = {'marker':{color: colors,size:sizes,
            // colorscale: [
            //     [0, '#000000'],
            //     [1, "#000000"]
            // ]
    }};
    Plotly.restyle('connectome-plot', update, [tn]);
    Plotly.restyle('brain-right', update, 4);
    Plotly.restyle('brain-front', update, 4);
    Plotly.restyle('brain-back', update, 4);

}

function dbselect(pn1,pn2){
    for(let i=0;i<54;i++){
        if(i!==pn1&&i!==pn2){
            colors[i]="#000000";
            sizes[i]=7;
        }else{
            sizes[i]=20;
        }
    }
    selectcolors(pn1);
    selectcolors(pn2);

    var update = {'marker':{color: colors,size:sizes,colorscale: [
                [0, '#000000'],
                [1, "#000000"]
            ]}};
    Plotly.restyle('connectome-plot', update, [tn]);
    Plotly.restyle('brain-right', update, 4);
    Plotly.restyle('brain-front', update, 4);
    Plotly.restyle('brain-back', update, 4);
}

function recover(){

    let info = connectomeInfo["connectome"];
    for (let attribute of ["con_x", "con_y", "con_z", "con_w"]) {
        if (!(attribute in info)) {
            info[attribute] = Array.from(decodeBase64(
                info["_" + attribute], "float32"));
            for (let i = 2; i < info[attribute].length; i += 3) {
                info[attribute][i] = null;
            }
        }
    }
    // var tn='5',
        update = {'marker':{
                size: info["marker_size"],
                color: info["con_w"],
                colorscale: [
                    [0, '#000000'],
                    [1, "#000000"]
                ],
            }};
    Plotly.restyle('connectome-plot', update, [tn]);
    Plotly.restyle('brain-right', update, 4);
    Plotly.restyle('brain-front', update, 4);
    Plotly.restyle('brain-back', update, 4);
}

function selectcolors(pn){
    switch (pn){
        case 36: colors[pn]='rgb(196, 156, 148)';
        break;
        case 42: colors[pn]='#F7B6D2';
        break;
        case 51: colors[pn]='#FF9896';
        break;
    }
}

function table(name,value,state){
    if(state===true){
        $("table").append("<tr id="+name+"><td style='text-align:center;'>" + name + "</td>"+"<td style='text-align:center;'>"+ value + "</td></tr>");
    }else{
        $("#"+name).remove();
    }
}

function plot(){
    d3.csv("test1.csv", function(err, rows){

        function unpack(rows, key) {
            return rows.map(function(row) { return row[key]; });
        }

        var trace1 = {
            type: "scatter",
            mode: "lines",
            name: 'ADHD',
            x: unpack(rows, 'times'),
            y: unpack(rows, 'adhd'),
            line: {color: '#cf1717'}
        }

        var trace2 = {
            type: "scatter",
            mode: "lines",
            name: 'TDC',
            x: unpack(rows, 'times'),
            y: unpack(rows, 'tdc'),
            line: {color: '#01b940'}
        }

        var trace3 = {
            type: "scatter",
            mode: "lines",
            name: 'ADHD',
            x: unpack(rows, 'times'),
            y: unpack(rows, 'trend3'),
            line: {color: '#b90107'}
        }

        var trace4 = {
            type: "scatter",
            mode: "lines",
            name: 'TDC',
            x: unpack(rows, 'times'),
            y: unpack(rows, 'trend4'),
            line: {color: '#01b940'}
        }

        var adhdvalue = new Array();
        var tdcvalue = new Array();
        var difference = new Array();

        adhdvalue = unpack(rows,'trend3');
        tdcvalue = unpack(rows,'trend4');
        for (let i = 0; i<172; i++){
            difference[i] = adhdvalue[i]-tdcvalue[i]
            if(difference[i]<0)
                difference[i]*=-1;
        }

        var trace5 = {
            type: "scatter",
            mode: "lines",
            name: 'Difference',
            x: unpack(rows, 'times'),
            y: difference,
            line: {color: '#0553ff'}
        }

        var data = [trace3,trace4,trace5];

        var layout = {
            title: 'Time Series',
            width: 620, // 设置宽度为400px
            height: 300 // 设置高度为200px


        };

        Plotly.newPlot('plot', data, layout);
    })
}
