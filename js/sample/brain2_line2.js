
function app(cluster,id,name,state) {

    svg = d3.select("#brain_line2")
        .append('svg').attr("class","svg_main")
        .attr("id",id)
        .attr("width",700)
        .attr("height",300)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
        .call(zoom);

    var rect = svg.append("rect")
        .attr("width", 700)
        .attr("height", 300)
        .style("fill", "none")
        .style("pointer-events", "all");

    // container = svg.append("g").attr("id",id);
    container = svg.append("g").attr("id","container");


    var x = d3.scale.ordinal().rangeBands([0, preferences['link_distance']-preferences['node_radius_min']*2],0.01);
    x.domain(new Array(preferences['seq_size']).fill(0).map(function(currentValue,index,array){return index;}));
    var color = d3.scale.ordinal().range(['#238b45','#444','#E44']).domain([-1,0,1]);


    path = container.selectAll(".area").data(data.links).enter().append('g').attr("class", "area")
        .attr("display", function (d, i) {
            if (d.value >= link_filter) {
                return 'inline';
            } else {
                return 'none';
            }
        })
        .each(function (d, i) {
            ld = d;
            d3.select(this).selectAll('.rect0').data(d.seq[0]).enter().insert('rect').attr('class', 'rect0')
                .attr('x', function (d, i) {
                    return 0;
                })
                .attr('y', function (d, i) {
                    return 0;
                })
                .attr('fill', function (d, i) {
                    return color(d);
                })
                .style('opacity', function (d, i) {
                    if (d === 0) {
                        return 0.5;
                    } else {
                        return 1;
                    }
                });

            d3.select(this).selectAll('.rect1').data(d.seq[1]).enter().insert('rect').attr('class', 'rect1')
                .attr('x', function (d, i) {
                    return 0;
                })
                .attr('y', function (d, i) {
                    return 0;
                })
                .attr('fill', function (d, i) {
                    return color(d);
                })
                .style('opacity', function (d, i) {
                    if (d === 0) {
                        return 0.5;
                    } else {
                        return 1;
                    }
                });
        });


    links = container.selectAll(".link").data(data.links).enter().insert("path").attr("class", "link");
    labels = container.selectAll('.label_')
        .data(data.nodes).enter().append('text').attr('class', 'label_')
        .text(function (d) {
            return d.oid + 1;
        }).style('z-index', 1)
        .attr('font-size', function (d) {
            return labelFontSizeScale(d.value) + 'px';
        })
        .attr('fill', 'null')
        .attr('id', function (d) {
            return "area-" + afqb.global.formatKeyName(d.name);
        })
        .attr('opacity', function (d) {
            return labelOpacityScale(d.value);
        })
        .style('display', function (d){
            if (d.cluster !== cluster)
                return 'none';
        })
    ;

    labels.on("click", function (d) {
        "use strict";
        var name = afqb.global.formatKeyName(d.name);
        var a = $("#area-" + name).attr("fill");
        if (a === "null") {
            afqb.plots.showHideTractDetails(true, name);
            nodeselect(true, name);//colorwall
            areaselect(true, name);//3d
        } else {
            afqb.plots.showHideTractDetails(false, name);
            nodeselect(false, name);
            areaselect(false, name);
        }

    });

    nodes = container.selectAll(".node").data(data.nodes).enter().append("circle", "svg").attr("class", "node")
        .attr('data-name', function (d) {
            return d.name;
        })//给每个节点添加名字
        .attr("r", 4)
        .style('stroke-width', 0)
        .style('display', function (d){
            if (d.cluster !== cluster)
                return 'none';
        })
    ;
    // d3.selectAll("circle").select("#none").remove();
    circleCenters = container.selectAll('.circleCenter').data(data.links).enter().insert('circle').attr('class', 'circleCenter').attr('r', 0).style('stroke-width', '0px');

    force.stop();
    force
        .nodes(data.nodes)
        .links(data.links)
        .on("tick", ticked)
        .on("end", end)
        .start();

    nodeselect(state,name);//改变点的颜色

    container.selectAll(".node").on("dblclick", dblclick).call(drag);
}