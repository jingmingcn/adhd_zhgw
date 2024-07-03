//color区域绘图
var nodesvalue;

//获取colorwall区域的长宽
const cw = document.getElementById('brain_line2').offsetWidth;
const ch = document.getElementById('tractlist-with-title').offsetHeight-460;

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

// $(function(){
//     bottom();
// });
var datasetselect;
var keyword;
var year_from ;
var year_to;
var threshold;
var node_r_min;
var node_r_max;
var link_distance;
var force_charge;
var toggle_label;
var author_name;
var link_filter;
var color_sensitivity;
var toggle_treemap;

var adhd_sample;
var tdc_sample;

var adhd_array;
var tdc_array;
var ChooseDataset;
var opacity;
var toggle_colorbar;
var Switch;

var frame_of_reference;
var window_size;
var window_step;
var filter_threshold;

if(!adhd_sample)		adhd_sample			= 2;
if(!tdc_sample)			tdc_sample			= 12;

if(!adhd_array)		    adhd_array			= 1;
if(!tdc_array)			tdc_array			= 1;
if(!opacity)            opacity             = 30;
if(!ChooseDataset)	            ChooseDataset	            = 'ADHD';
if (toggle_colorbar === 'true') {
    toggle_colorbar = false;
} else {
    toggle_colorbar = true;
}
if (Switch === 'true') {
    Switch = false;
} else {
    Switch = true;
}


if(!frame_of_reference)	frame_of_reference	= 'ADHD';
if(!window_size)		window_size			= 20;
if(!window_step)		window_step			= 10;
if(!filter_threshold)	filter_threshold	= 11;
if(!datasetselect)	    datasetselect	    = 'ADHD';


var data, mdata;

const url = "brain_net_2.json";

const topKeywords = ["visualization", "data", "interactive", "volume", "analysis", "exploring", "rendering", "analytical", "information", "surface"];

if (!keyword) keyword = '';
if (!year_from) year_from = 1990;
if (!year_to) year_to = 2016;
if (!threshold) threshold = 0;
if (!node_r_min) node_r_min = 4;
if (!node_r_max) node_r_max = 4;
if (!link_distance) link_distance = 200;
if (!force_charge) force_charge = -1;
if (toggle_label === 'false') {
    toggle_label = false;
} else {
    toggle_label = true;
}
if (!author_name) author_name = '';
if (!link_filter) link_filter = threshold;
if (!color_sensitivity) color_sensitivity = 20;

if (toggle_treemap === 'true') {
    toggle_treemap = true;
} else {
    toggle_treemap = false;
}


var margin = {top: -5, right: -5, bottom: -5, left: -5};
var window_width = $(window).width(),
    window_height = $(window).height();

var preferences = {
    'link_distance': parseInt(link_distance),
    'node_radius_min': parseInt(node_r_min),
    'node_radius_max': parseInt(node_r_max),
    'node_edge_size': 2,
    'force_charge': parseInt(force_charge),
    'toggle_label': toggle_label,
    'year_from': Number.MAX_VALUE,
    'year_to': Number.MIN_VALUE,
    'seq_min': Number.MAX_VALUE,
    'seq_max': Number.MIN_VALUE,
    'seq_size': 16,
    'seq_threshold': parseInt(threshold),
    'link_filter': parseInt(link_filter),
    'width': $(window).width() - margin.left - margin.right,
    'height': $(window).height() - margin.top - margin.bottom,
    'keyword': keyword,
    'topKeyword': topKeywords[0],
    'filter_year_from': year_from,
    'filter_year_to': year_to,
    'node_name': '',
    'node_value': 0,
    'node_rel': 0,
    'color_sensitivity': parseInt(color_sensitivity),
    'toggle_treemap': toggle_treemap,

    'datasetselect':datasetselect,
    'adhd_sample': adhd_sample,
    'tdc_sample': tdc_sample,

    //增加了数组两个选项的依据
    'adhd_array': adhd_array,
    'tdc_array': tdc_array,
    'ChooseDataset':ChooseDataset,
    'opacity':opacity,
    'toggle_colorbar':toggle_colorbar,
    'Switch':Switch,

    'frame_of_reference': frame_of_reference,
    'window_size': parseInt(window_size),
    'window_step': parseInt(window_size) % parseInt(window_step) == 0? parseInt(window_step):parseInt(window_size),
    'filter_threshold': parseFloat(filter_threshold)
};

preferences['seq_size']= Math.floor(172/preferences['window_size'])*preferences['window_size']/preferences['window_step'];

var svg, container;
var nodes;
var labels;
var links;
var circleCenters;
var path;
var area_x_scale;
var area;
var simulation;
var forceLink;
var forceCenter;
var nodeValueMax, nodeValueMin;

var rScale = d3.scale.log().range([4, 20]);//定义各种范围比例尺
var labelFontSizeScale = d3.scale.log().range([8, 20]);
var labelOpacityScale = d3.scale.log().range([0.4, 1])
var yScale = d3.scale.linear().range([preferences['height'] - 20, 20]);
var xScale = d3.scale.linear().domain(["a".charCodeAt(0), "z".charCodeAt(0)]).range([0, preferences['width']]);
var lOpacity = d3.scale.linear().range([0.1, 0.9]);

var w = +preferences['width'],
    h = +preferences['height'];

var force = d3.layout.forceInABox()
    .size([w, (h - 50)])
    .treemapSize([w, (h - 50)])
    .enableGrouping(true)
    .charge(force_charge);

var zoom = d3.behavior.zoom()
    .scaleExtent([0.1, 10])
    .on("zoom", zoomed);

var drag = d3.behavior.drag()
    .origin(function (d) {
        return d;
    })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

var drag1 = d3.behavior.drag()
    .origin(function (d) {
        return d;
    })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);


function zoomed() {
    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
    if (d3.select(this).attr('class') == 'node') {
        d3.select(this).classed("fixed", d.fixed = true);
        end();
    }
}

function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    if (d3.select(this).attr('class') == "node") {
        end();
    }
}

function dragended(d) {
    d3.select(this).classed("dragging", false);
    console.log(d3.select(this).attr('class'))
    if (d3.select(this).attr('class') == "node") {
        end();
    }
}

var innerLinePostion = function (d) {
    var x1 = d.source.x,
        y1 = d.source.y,
        x2 = d.target.x,
        y2 = d.target.y,
        l = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
    l_ = preferences['node_radius_min'] / 1 + preferences['edge_size'] / 1;
    var x1_ = x1 + l_ * (x2 - x1) / l,
        y1_ = y1 + l_ * (y2 - y1) / l,
        x2_ = x2 + l_ * (x1 - x2) / l,
        y2_ = y2 + l_ * (y1 - y2) / l;
    return [x1_, y1_, x2_, y2_];
};

var ticked = function (e) {

    force.onTick(e);

    //Collision detection
    var q = d3.geom.quadtree(data.nodes),
        k = e.alpha * 0.1,
        i = 0,
        n = data.nodes.length,
        o;

    while (++i < n) {
        o = data.nodes[i];
        if (o.fixed) continue;
        q.visit(collide(o));
    }

    nodes.attr("cx", function (d) {
        return d.x;
    })
        .attr("cy", function (d) {
            return d.y;
        });
};

var end = function (e) {
    labels.attr('dx', function (d) {
        return d.x;
    })
        .attr('dy', function (d) {
            return d.y + this.getBBox().height;
        });

    links.each(function (d) {
        d.center = circleCenter(d.source.x, d.source.y, d.target.x, d.target.y, 60);
    });

    links.attr("d", function (d) {
        var x1 = innerLinePostion(d)[0],
            y1 = innerLinePostion(d)[1],
            x2 = innerLinePostion(d)[2],
            y2 = innerLinePostion(d)[3];
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);

        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    });

    circleCenters.attr('cx', function (d) {
        return d.center.x;
    })
        .attr('cy', function (d) {
            return d.center.y
        });

    path.each(function (d, i) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        var source = d.source;
        var target = d.target;
        var center = d.center;

        var min_r = 4;

        var source_r = 4;
        var target_r = 4;

        var radians = Math.atan2(-(source.y - center.y), (source.x - center.x));
        var degrees = radians * 180 / Math.PI;

        var degree_margin_source = Math.atan2(source_r, dr) * 180 / Math.PI / 2;
        var degree_margin_target = Math.atan2(target_r, dr) * 180 / Math.PI / 2;
        var degree_between = 60 - degree_margin_source - degree_margin_target;

        d3.select(this).selectAll('.rect0').each(function (s, i) {
            block_count = preferences['seq_size'] + Math.floor((preferences['seq_size'] - 1) / 500);
            area_width = (dr - source_r - target_r) / block_count;

            d3.select(this).attr('x', center.x).attr('y', center.y)
                .attr('width', area_width)
                .attr('height', area_width)
                .attr('transform', function () {

                    degree = -degrees + 90 + degree_margin_source + (degree_between / block_count) * (i + Math.floor(i / 500)) + degree_between / 2 / block_count;
                    return 'rotate(' + degree + ' ' + center.x + ' ' + center.y + ') translate(' + -d3.select(this).attr('width') / 2 + ',' + -(dr + area_width * 3 / 2) + ')';
                });
        });

        d3.select(this).selectAll('.rect1').each(function (s, i) {
            block_count = preferences['seq_size'] + Math.floor((preferences['seq_size'] - 1) / 500);
            area_width = (dr - source_r - target_r) / block_count;

            d3.select(this).attr('x', center.x).attr('y', center.y)
                .attr('width', area_width / 2)
                .attr('height', area_width / 2)
                .attr('transform', function () {

                    degree = -degrees + 90 + degree_margin_source + (degree_between / block_count) * (i + Math.floor(i / 500)) + degree_between / 2 / block_count;
                    return 'rotate(' + degree + ' ' + center.x + ' ' + center.y + ') translate(' + -d3.select(this).attr('width') / 2 + ',' + -(dr + area_width * 5 / 4) + ')';
                });
        });
    });

}

function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = false);
    uri = window.location.href;
    window.location.href = updateQueryStringParameter(uri, 'author_name', d.id);
}

$(window).resize(function () {
    var width = $(window).width();
    var height = $(window).height();
    svg.attr("width", width).attr("height", height);
    forceCenter.x(width / 2);
    forceCenter.y(height / 2);
    simulation.restart();
});

$('#nodeEdge').change(function () {
    edge = $('#nodeEdge').val();
    nodes.transition().style('stroke-width', edge);

    d3.selectAll('.path').remove();
    area_x_scale = d3.scaleLinear().range([0, linkDistance - radius * 2 - edge * 2]).domain([0, seq_size - 1]);
    area = d3.area().x(function (d, i) {
        return area_x_scale(i);
    }).y0(seq_max).y1(function (d, i) {
        return d;
    });
    path.insert("path").attr('class', 'path').datum(function (d) {
        return d.seq;
    }).attr("d", area);

    ticked();
});

$('#linkDistance').change(function () {
    linkDistance = $('#linkDistance').val();
    forceLink.distance(linkDistance);

    d3.selectAll('.path').remove();
    area_x_scale = d3.scaleLinear().range([0, linkDistance - radius * 2 - edge * 2]).domain([0, seq_size - 1]);
    area = d3.area().x(function (d, i) {
        return area_x_scale(i);
    }).y0(seq_max).y1(function (d, i) {
        return d;
    });
    path.insert("path").attr('class', 'path').datum(function (d) {
        return d.seq;
    }).attr("d", area);

    simulation.alpha(1).restart();
});


// theta is degree
var circleCenter = function (x1, y1, x2, y2, theta) {
    var radians = theta * Math.PI / 180;

    var d1 = x2 - Math.cos(radians) * x1 + Math.sin(radians) * y1,
        d2 = y2 - Math.sin(radians) * x1 - Math.cos(radians) * y1;

    var x = (d1 * (1 - Math.cos(radians)) - d2 * Math.sin(radians)) / (1 - Math.cos(radians)) / 2,
        y = (d1 - x * (1 - Math.cos(radians))) / Math.sin(radians);

    return {'x': x, 'y': y};
};


function collide(node) {
    var r = rScale(node.value) + 16,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function (quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = rScale(node.value) + rScale(quad.point.value);
            if (l < r) {
                l = (l - r) / l * .5;
                node.px += x * l;
                node.py += y * l;
            }
        }
        return x1 > nx2
            || x2 < nx1
            || y1 > ny2
            || y2 < ny1;
    };
}


function test1(state, name){
    var cluster;
    var id ;
    if (state === true) {
        if(datasetselect==='ADHD'){

            brain2(id,cluster,name,state);
            plot();

        }else{
            d3.json(url, function (error, mdata) {
                if (error) throw error;
                data = mdata;
                preferences['seq_size'] = 16;
                netClustering.cluster(data.nodes, data.links);
                for (let i=0;i<data.nodes.length;i++){
                    if(afqb.global.formatKeyName(data.nodes[i].name)===name){
                        cluster=data.nodes[i].cluster;
                        id="id"+cluster;
                    }
                }

                data.links = data.links.filter(d => {
                    return data.nodes[d.source].cluster === data.nodes[d.target].cluster && data.nodes[d.source].cluster === cluster;
                });


                yScale.domain([0, d3.max(data.nodes, function (d) {
                    return d.value;
                })]);
                lOpacity.domain(d3.extent(data.links, function (d) {
                    return d.value;
                }));

                labelFontSizeScale.domain([d3.min(data.nodes, function (d) {
                    return d.value;
                }), d3.max(data.nodes, function (d) {
                    return d.value;
                })]);
                labelOpacityScale.domain([d3.min(data.nodes, function (d) {
                    return d.value;
                }), d3.max(data.nodes, function (d) {
                    return d.value;
                })]);

                app(cluster,id,name,state);

            });
        }

    } else {
        if(datasetselect==='ADHD'){
            d3.json('adhd_'+adhd_sample+'.json',function(error,adhd_data){
                d3.json('tdc_'+tdc_sample+'.json',function(error,tdc_data) {
                    if (error) throw error;
                    var brain_roi_labels = ["Precentral_L", "Precentral_R", "Frontal_Sup_L", "Frontal_Sup_R", "Frontal_Sup_Orb_L", "Frontal_Sup_Orb_R", "Frontal_Mid_L", "Frontal_Mid_R", "Frontal_Mid_Orb_L", "Frontal_Mid_Orb_R", "Frontal_Inf_Oper_L", "Frontal_Inf_Oper_R", "Frontal_Inf_Tri_L", "Frontal_Inf_Tri_R", "Frontal_Inf_Orb_L", "Frontal_Inf_Orb_R", "Rolandic_Oper_L", "Rolandic_Oper_R", "Supp_Motor_Area_L", "Supp_Motor_Area_R", "Olfactory_L", "Olfactory_R", "Frontal_Sup_Medial_L", "Frontal_Sup_Medial_R", "Frontal_Med_Orb_L", "Frontal_Med_Orb_R", "Rectus_L", "Rectus_R", "Insula_L", "Insula_R", "Cingulum_Ant_L", "Cingulum_Ant_R", "Cingulum_Mid_L", "Cingulum_Mid_R", "Cingulum_Post_L", "Cingulum_Post_R", "Hippocampus_L", "Hippocampus_R", "ParaHippocampal_L", "ParaHippocampal_R", "Amygdala_L", "Amygdala_R", "Calcarine_L", "Calcarine_R", "Cuneus_L", "Cuneus_R", "Lingual_L", "Lingual_R", "Occipital_Sup_L", "Occipital_Sup_R", "Occipital_Mid_L", "Occipital_Mid_R", "Occipital_Inf_L", "Occipital_Inf_R", "Fusiform_L", "Fusiform_R", "Postcentral_L", "Postcentral_R", "Parietal_Sup_L", "Parietal_Sup_R", "Parietal_Inf_L", "Parietal_Inf_R", "SupraMarginal_L", "SupraMarginal_R", "Angular_L", "Angular_R", "Precuneus_L", "Precuneus_R", "Paracentral_Lobule_L", "Paracentral_Lobule_R", "Caudate_L", "Caudate_R", "Putamen_L", "Putamen_R", "Pallidum_L", "Pallidum_R", "Thalamus_L", "Thalamus_R", "Heschl_L", "Heschl_R", "Temporal_Sup_L", "Temporal_Sup_R", "Temporal_Pole_Sup_L", "Temporal_Pole_Sup_R", "Temporal_Mid_L", "Temporal_Mid_R", "Temporal_Pole_Mid_L", "Temporal_Pole_Mid_R", "Temporal_Inf_L", "Temporal_Inf_R", "Cerebelum_Crus1_L", "Cerebelum_Crus1_R", "Cerebelum_Crus2_L", "Cerebelum_Crus2_R", "Cerebelum_3_L", "Cerebelum_3_R", "Cerebelum_4_5_L", "Cerebelum_4_5_R", "Cerebelum_6_L", "Cerebelum_6_R", "Cerebelum_7b_L", "Cerebelum_7b_R", "Cerebelum_8_L", "Cerebelum_8_R", "Cerebelum_9_L", "Cerebelum_9_R", "Cerebelum_10_L", "Cerebelum_10_R", "Vermis_1_2", "Vermis_3", "Vermis_4_5", "Vermis_6", "Vermis_7", "Vermis_8", "Vermis_9", "Vermis_10"];
                    var mean_labels = ["Mean_2001", "Mean_2002", "Mean_2101", "Mean_2102", "Mean_2111", "Mean_2112", "Mean_2201", "Mean_2202", "Mean_2211", "Mean_2212", "Mean_2301", "Mean_2302", "Mean_2311", "Mean_2312", "Mean_2321", "Mean_2322", "Mean_2331", "Mean_2332", "Mean_2401", "Mean_2402", "Mean_2501", "Mean_2502", "Mean_2601", "Mean_2602", "Mean_2611", "Mean_2612", "Mean_2701", "Mean_2702", "Mean_3001", "Mean_3002", "Mean_4001", "Mean_4002", "Mean_4011", "Mean_4012", "Mean_4021", "Mean_4022", "Mean_4101", "Mean_4102", "Mean_4111", "Mean_4112", "Mean_4201", "Mean_4202", "Mean_5001", "Mean_5002", "Mean_5011", "Mean_5012", "Mean_5021", "Mean_5022", "Mean_5101", "Mean_5102", "Mean_5201", "Mean_5202", "Mean_5301", "Mean_5302", "Mean_5401", "Mean_5402", "Mean_6001", "Mean_6002", "Mean_6101", "Mean_6102", "Mean_6201", "Mean_6202", "Mean_6211", "Mean_6212", "Mean_6221", "Mean_6222", "Mean_6301", "Mean_6302", "Mean_6401", "Mean_6402", "Mean_7001", "Mean_7002", "Mean_7011", "Mean_7012", "Mean_7021", "Mean_7022", "Mean_7101", "Mean_7102", "Mean_8101", "Mean_8102", "Mean_8111", "Mean_8112", "Mean_8121", "Mean_8122", "Mean_8201", "Mean_8202", "Mean_8211", "Mean_8212", "Mean_8301", "Mean_8302", "Mean_9001", "Mean_9002", "Mean_9011", "Mean_9012", "Mean_9021", "Mean_9022", "Mean_9031", "Mean_9032", "Mean_9041", "Mean_9042", "Mean_9051", "Mean_9052", "Mean_9061", "Mean_9062", "Mean_9071", "Mean_9072", "Mean_9081", "Mean_9082", "Mean_9100", "Mean_9110", "Mean_9120", "Mean_9130", "Mean_9140", "Mean_9150", "Mean_9160", "Mean_9170"];
                    var links_map = new Map();
                    var nodes_ = new Array();
                    brain_roi_labels.forEach((d1, i1) => {
                        brain_roi_labels.forEach((d2, i2) => {
                            if (i1 != i2) {
                                let key = i1 > i2 ? i1 + "|" + i2 : i2 + "|" + i1;
                                let source, target;
                                if (i1 > i2) {
                                    source = i1;
                                    target = i2;
                                } else {
                                    source = i2;
                                    target = i1;
                                }

                                if (!links_map.has(key)) {
                                    var adhd_seq = [];
                                    var tdc_seq = [];
                                    links_map.set(key, {
                                        'source': source,
                                        'target': target,
                                        'seq': [adhd_seq, tdc_seq]
                                    });
                                    for (var i = 0; i < 172 - preferences['window_size']; i += preferences['window_step']) {
                                        var a1 = [], a2 = [];
                                        var t1 = [], t2 = [];

                                        for (j = 0; j < preferences['window_size']; j++) {
                                            a1.push(adhd_data[i + j][mean_labels[source]]);
                                            a2.push(adhd_data[i + j][mean_labels[target]]);
                                            t1.push(tdc_data[i + j][mean_labels[source]]);
                                            t2.push(tdc_data[i + j][mean_labels[target]]);
                                        }

                                        v1 = jStat.corrcoeff(a1, a2);
                                        if (v1 >= 0.4) {
                                            v1 = 1;
                                        } else {
                                            v1 = 0;
                                        }
                                        v2 = jStat.corrcoeff(t1, t2);
                                        if (v2 >= 0.4) {
                                            v2 = 1;
                                        } else {
                                            v2 = 0;
                                        }

                                        adhd_seq.push(v1);
                                        tdc_seq.push(v2);
                                    }
                                }
                            }
                        });
                    });

                    brain_roi_labels.forEach((d, i) => {
                        nodes_.push({
                            'id': i,
                            'name': d,
                            'value': 0
                        });
                    });

                    var links_ = new Array();
                    data = {'nodes': nodes_, 'links': links_};

                    links_map.forEach((v, k) => {

                        v.value = levenshteinDistance(v.seq[0].join(''), v.seq[1].join(''));
                        //v.value = math.distance(v.seq[0],v.seq[1]);
                        if (v.value >= filter_threshold) {
                            links_.push(v);
                        }
                    });

                    nodes_.forEach((v, i) => {
                        links_.forEach((l) => {
                            if (l.target == i || l.source == i) {
                                v.value += l.value;
                            }
                        });
                    });

                    let nodes__ = data.nodes.filter(n => {
                        let f = false;
                        links_.forEach((l) => {
                            if (l.target == n.id || l.source == n.id) {
                                f = true;
                            }
                        });
                        return f;
                    }).map(n => {
                        return {name: n.name, value: n.value, oid: n.id}
                    });

                    links_.forEach((l) => {
                        nodes__.forEach((v, i) => {
                            if (l.source == v.oid) {
                                l.source = i
                            }
                            if (l.target == v.oid) {
                                l.target = i
                            }
                        })
                    });

                    data.nodes = nodes__;

                    netClustering.cluster(data.nodes, data.links);

                    for (var i = 0; i < data.nodes.length; i++) {
                        if (afqb.global.formatKeyName(data.nodes[i].name) === name) {
                            id = data.nodes[i].cluster;
                            nodesvalue=data.nodes[i].value;
                        }
                    }
                    table(name,nodesvalue,state);
                    b(id);

                })
            })
            nodeselect(state,name);
            areaselect(state,name);
        }else{
            d3.json(url, function (error, mdata) {
                var id;
                if (error) throw error;
                data = mdata;
                preferences['seq_size'] = 16;
                netClustering.cluster(data.nodes, data.links);

                for (var i = 0; i < data.nodes.length; i++) {
                    if (afqb.global.formatKeyName(data.nodes[i].name) === name)
                        id= data.nodes[i].cluster;
                }
                b(id);
            });
            nodeselect(state,name);
            areaselect(state,name);

        }
    }
}

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
        .attr("id",function(d){
            if (d.cluster !== cluster)
                return 'none';
            })
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
        .attr("id",function(d){
            if (d.cluster !== cluster)
                return 'none';
        })
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
    areaselect(state,name);
    container.selectAll(".node").on("dblclick", dblclick).call(drag);
}

function bottom(){
    svg_bottom = d3.select("#svg_bottom").append("svg").attr("class","svg_bottom").attr("width",600).attr("height",50).attr("top",600);

    svg_bottom.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(5,5)");

    svg_bottom.append("g")
        .attr("class", "legendSequentialNode")
        .attr("transform", "translate(5,30)");

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "mytooltip")
        .style("opacity", 0);

    var sequentialScale = d3v4.scaleSequential(d3v4.interpolateReds).domain([0,preferences['seq_max']]);
    var sequentialScaleNode = d3v4.scaleSequential(d3v4.interpolateSpectral).domain([nodeValueMax,nodeValueMin]);
    // var sequentialScaleNode = d3v4.scaleSequential(d3v4.interpolateGreens(1)).domain([nodeValueMax,nodeValueMin]);

    var legendSequential = d3.legend.color()
        .labelFormat(x=>Math.round(x))
        .shapeWidth(20)
        .shapeHeight(10)
        .cells(preferences['seq_max']+1)
        .orient("horizontal")
        .scale(sequentialScale);

    var legendSequentialNode = d3.legend.color()
        .labelFormat(x=>Math.round(x))
        .shapeWidth(20)
        .shapeHeight(10)
        .ascending(true)
        .cells(nodeValueMax-nodeValueMin<preferences['color_sensitivity']?nodeValueMax-nodeValueMin:preferences['color_sensitivity'])
        .orient("horizontal")
        .scale(sequentialScaleNode);

    svg_bottom.select(".legendSequential")
        .call(legendSequential);

    svg_bottom.select(".legendSequentialNode")
        .call(legendSequentialNode);
}

function b(id) {
    // d3.select("#id"+id).remove();
    return;
}


function brain2(id,cluster,name,state){

    d3.json('adhd_'+adhd_sample+'.json',function(error,adhd_data){
        d3.json('tdc_'+tdc_sample+'.json',function(error,tdc_data){
            if(error) throw error;
            var brain_roi_labels = ["Precentral_L","Precentral_R","Frontal_Sup_L","Frontal_Sup_R","Frontal_Sup_Orb_L","Frontal_Sup_Orb_R","Frontal_Mid_L","Frontal_Mid_R","Frontal_Mid_Orb_L","Frontal_Mid_Orb_R","Frontal_Inf_Oper_L","Frontal_Inf_Oper_R","Frontal_Inf_Tri_L","Frontal_Inf_Tri_R","Frontal_Inf_Orb_L","Frontal_Inf_Orb_R","Rolandic_Oper_L","Rolandic_Oper_R","Supp_Motor_Area_L","Supp_Motor_Area_R","Olfactory_L","Olfactory_R","Frontal_Sup_Medial_L","Frontal_Sup_Medial_R","Frontal_Med_Orb_L","Frontal_Med_Orb_R","Rectus_L","Rectus_R","Insula_L","Insula_R","Cingulum_Ant_L","Cingulum_Ant_R","Cingulum_Mid_L","Cingulum_Mid_R","Cingulum_Post_L","Cingulum_Post_R","Hippocampus_L","Hippocampus_R","ParaHippocampal_L","ParaHippocampal_R","Amygdala_L","Amygdala_R","Calcarine_L","Calcarine_R","Cuneus_L","Cuneus_R","Lingual_L","Lingual_R","Occipital_Sup_L","Occipital_Sup_R","Occipital_Mid_L","Occipital_Mid_R","Occipital_Inf_L","Occipital_Inf_R","Fusiform_L","Fusiform_R","Postcentral_L","Postcentral_R","Parietal_Sup_L","Parietal_Sup_R","Parietal_Inf_L","Parietal_Inf_R","SupraMarginal_L","SupraMarginal_R","Angular_L","Angular_R","Precuneus_L","Precuneus_R","Paracentral_Lobule_L","Paracentral_Lobule_R","Caudate_L","Caudate_R","Putamen_L","Putamen_R","Pallidum_L","Pallidum_R","Thalamus_L","Thalamus_R","Heschl_L","Heschl_R","Temporal_Sup_L","Temporal_Sup_R","Temporal_Pole_Sup_L","Temporal_Pole_Sup_R","Temporal_Mid_L","Temporal_Mid_R","Temporal_Pole_Mid_L","Temporal_Pole_Mid_R","Temporal_Inf_L","Temporal_Inf_R","Cerebelum_Crus1_L","Cerebelum_Crus1_R","Cerebelum_Crus2_L","Cerebelum_Crus2_R","Cerebelum_3_L","Cerebelum_3_R","Cerebelum_4_5_L","Cerebelum_4_5_R","Cerebelum_6_L","Cerebelum_6_R","Cerebelum_7b_L","Cerebelum_7b_R","Cerebelum_8_L","Cerebelum_8_R","Cerebelum_9_L","Cerebelum_9_R","Cerebelum_10_L","Cerebelum_10_R","Vermis_1_2","Vermis_3","Vermis_4_5","Vermis_6","Vermis_7","Vermis_8","Vermis_9","Vermis_10"];
            var mean_labels = ["Mean_2001","Mean_2002","Mean_2101","Mean_2102","Mean_2111","Mean_2112","Mean_2201","Mean_2202","Mean_2211","Mean_2212","Mean_2301","Mean_2302","Mean_2311","Mean_2312","Mean_2321","Mean_2322","Mean_2331","Mean_2332","Mean_2401","Mean_2402","Mean_2501","Mean_2502","Mean_2601","Mean_2602","Mean_2611","Mean_2612","Mean_2701","Mean_2702","Mean_3001","Mean_3002","Mean_4001","Mean_4002","Mean_4011","Mean_4012","Mean_4021","Mean_4022","Mean_4101","Mean_4102","Mean_4111","Mean_4112","Mean_4201","Mean_4202","Mean_5001","Mean_5002","Mean_5011","Mean_5012","Mean_5021","Mean_5022","Mean_5101","Mean_5102","Mean_5201","Mean_5202","Mean_5301","Mean_5302","Mean_5401","Mean_5402","Mean_6001","Mean_6002","Mean_6101","Mean_6102","Mean_6201","Mean_6202","Mean_6211","Mean_6212","Mean_6221","Mean_6222","Mean_6301","Mean_6302","Mean_6401","Mean_6402","Mean_7001","Mean_7002","Mean_7011","Mean_7012","Mean_7021","Mean_7022","Mean_7101","Mean_7102","Mean_8101","Mean_8102","Mean_8111","Mean_8112","Mean_8121","Mean_8122","Mean_8201","Mean_8202","Mean_8211","Mean_8212","Mean_8301","Mean_8302","Mean_9001","Mean_9002","Mean_9011","Mean_9012","Mean_9021","Mean_9022","Mean_9031","Mean_9032","Mean_9041","Mean_9042","Mean_9051","Mean_9052","Mean_9061","Mean_9062","Mean_9071","Mean_9072","Mean_9081","Mean_9082","Mean_9100","Mean_9110","Mean_9120","Mean_9130","Mean_9140","Mean_9150","Mean_9160","Mean_9170"];
            var links_map = new Map();
            var nodes_ = new Array();
            var txt="";
            var x;
            //将json改成nilearn可以使用的txt
            adhd_data.forEach((d,i)=>{
                for ( x in d){
                    txt=txt+"    "+d[x];
                }
                txt=txt+"\n";
                    });
            console.log(txt);

            tdc_data.forEach((d,i)=>{
                for ( x in d){
                    txt=txt+"    "+d[x];
                }
                txt=txt+"\n";
            });
            console.log(txt);
//下面是用来采集画折线图的数据的
//             adhd_data.forEach((d,i)=>{
//                 txt=txt+"\n"+d.Mean_9110
//             });
//             console.log(txt)

            // tdc_data.forEach((d,i)=>{
            //     txt=txt+"\n"+d.Mean_9110
            // });
            // console.log(txt)

            brain_roi_labels.forEach((d1,i1)=>{
                brain_roi_labels.forEach((d2,i2)=>{
                    if(i1!=i2){
                        let key = i1>i2?i1+"|"+i2:i2+"|"+i1;
                        let source, target;
                        if(i1>i2){
                            source = i1;
                            target = i2;
                        }else{
                            source = i2;
                            target = i1;
                        }

                        if(!links_map.has(key)){
                            var adhd_seq = [];
                            var tdc_seq = [];
                            links_map.set(key,{
                                'source':source,
                                'target':target,
                                'seq':[adhd_seq,tdc_seq]
                            });
                            for(var i=0;i<172-preferences['window_size'];i+=preferences['window_step']){
                                var a1 = [], a2 = [];
                                var t1 = [], t2 = [];

                                for(j=0;j<preferences['window_size'];j++){
                                    a1.push(adhd_data[i+j][mean_labels[source]]);
                                    a2.push(adhd_data[i+j][mean_labels[target]]);
                                    t1.push(tdc_data[i+j][mean_labels[source]]);
                                    t2.push(tdc_data[i+j][mean_labels[target]]);
                                }

                                v1 = jStat.corrcoeff(a1,a2);
                                if(v1>=0.4){
                                    v1 = 1;
                                }else{
                                    v1 = 0;
                                }
                                v2 = jStat.corrcoeff(t1,t2);
                                if(v2>=0.4){
                                    v2 = 1;
                                }else{
                                    v2 = 0;
                                }

                                adhd_seq.push(v1);
                                tdc_seq.push(v2);
                            }
                        }
                    }
                });
            });

            brain_roi_labels.forEach((d,i)=>{
                nodes_.push({
                    'id':i,
                    'name':d,
                    'value':0
                });
            });

            var links_ = new Array();
            data = {'nodes':nodes_,'links':links_};

            links_map.forEach((v,k)=>{

                v.value  = levenshteinDistance(v.seq[0].join(''),v.seq[1].join(''));
                //v.value = math.distance(v.seq[0],v.seq[1]);
                if(v.value>=filter_threshold){
                    links_.push(v);
                }
            });

            nodes_.forEach((v,i)=>{
                links_.forEach((l)=>{
                    if(l.target == i || l.source == i){
                        v.value += l.value;
                    }
                });
            });

            let nodes__ = data.nodes.filter(n=>{
                let f = false;
                links_.forEach((l)=>{
                    if(l.target == n.id || l.source == n.id){
                        f = true;
                    }
                });
                return f;
            }).map(n=>{return {name:n.name,value:n.value,oid:n.id}});

            links_.forEach((l)=>{
                nodes__.forEach((v,i)=>{
                    if(l.source==v.oid){
                        l.source = i
                    }
                    if(l.target==v.oid){
                        l.target = i
                    }
                })
            });

            data.nodes = nodes__;

            netClustering.cluster(data.nodes, data.links);

            for (var i=0;i<data.nodes.length;i++){
                if(afqb.global.formatKeyName(data.nodes[i].name)===name){
                    cluster=data.nodes[i].cluster;
                    id="id"+cluster;
                    nodesvalue=data.nodes[i].value;
                }
            }

            table(name,nodesvalue,state);
            data.links = data.links.filter(d=>{
                return data.nodes[d.source].cluster === data.nodes[d.target].cluster&&data.nodes[d.source].cluster === cluster;
            });

            var edge_value_scale = d3.scale.linear().range([0,1]).domain([0,d3.max(data.links,function(d){return d.value;})]);

            yScale.domain([0, d3.max(data.nodes, function (d) { return d.value; } )]);
            lOpacity.domain(d3.extent(data.links, function (d) { return d.value; } ));

            labelFontSizeScale.domain([d3.min(data.nodes, function (d) { return d.value; } ), d3.max(data.nodes, function (d) { return d.value; } )]);
            labelOpacityScale.domain([d3.min(data.nodes, function (d) { return d.value; } ), d3.max(data.nodes, function (d) { return d.value; } )]);
            // debugger;
            bpp(cluster,id,name,state);
        });
    });
}

function bpp(cluster,id,name,state) {

    svg = d3.select("#brain_line2")
        .append("svg").attr("class","svg_main")
        .attr("id",id)
        .attr("width",cw)
        .attr("height",ch)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
        .call(zoom);
// console.log(cw+'////'+ch)
    var rect = svg.append("rect")
        .attr("width", cw)
        .attr("height", ch)
        .style("fill", "none")
        .style("pointer-events", "all");

    container = svg.append("g").attr("id","container");

    // svg_bottom = d3.select("body").append("svg").attr("class","svg_bottom").attr("width",window_width).attr("height",50).attr("top",window_height-50);

    var x = d3.scale.ordinal().rangeBands([0, preferences['link_distance']-preferences['node_radius_min']*2],0.01);
    x.domain(new Array(preferences['seq_size']).fill(0).map(function(currentValue,index,array){return index;}));
    // var color = d3.scale.ordinal().range(['#238b45','#444','#E44']).domain([1,0,-1]);


    path = container.selectAll(".area").data(data.links).enter().append('g').attr("class","area")
        .attr("display",function(d,i){
            if(d.value>=link_filter){
                return 'inline';
            }else{
                return 'none';
            }
        })
        .each(function(d,i){
            ld = d;
            d3.select(this).selectAll('.rect0').data(d.seq[0]).enter().insert('rect').attr('class','rect0')
                .attr('x',function(d,i){return 0;})
                .attr('y',function(d,i){return 0;})
                .attr('fill',function(d,i){
                    return d3v4.interpolateGreens(d);
                })
                .style('opacity',function(d,i){

                })
            ;
            d3.select(this).selectAll('.rect1').data(d.seq[1]).enter().insert('rect').attr('class','rect1')
                .attr('x',function(d,i){return 0;})
                .attr('y',function(d,i){return 0;})
                .attr('fill',function(d,i){
                    return d3v4.interpolateGreens(d);
                })
                .style('opacity',function(d,i){

                })
            ;
        });


    links = container.selectAll(".link").data(data.links).enter().insert("path").attr("class","link");
    labels = container.selectAll('.label_')
        .data(data.nodes).enter().append('text').attr('class','label_')
        .text(function(d,i){return d.oid + 1;}).style('z-index',1)
        .attr('font-size',function(d){
            return labelFontSizeScale(d.value)+'px';
        })
        .attr('fill', 'null')
        .attr('id', function (d) {
            return "area-" + afqb.global.formatKeyName(d.name);
        })
        .attr('opacity',function(d){
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

    nodes = container.selectAll(".node").data(data.nodes).enter().append("circle","svg").attr("class","node")
        .attr("r",4)
        .attr('data-name', function (d) {
            return d.name;
        })
        .style('stroke-width',0)
        .style('fill',function(d){
        })
        .style('display', function (d){
            if (d.cluster !== cluster)
                return 'none';
        })
    ;

    circleCenters = container.selectAll('.circleCenter').data(data.links).enter().insert('circle').attr('class','circleCenter').attr('r',0).style('stroke-width','0px');

    force.stop();
    force
        .nodes(data.nodes)
        .links(data.links)
        .on("tick", ticked)
        .on("end",end)
        .start();

    nodeselect(state,name);//改变labels的颜色
    areaselect(state,name);
    //var drag = force.drag().on("dragstart", dragstart);
    container.selectAll(".node").on("dblclick", dblclick).call(drag);

}

const gui = new dat.GUI();
const brain2_line_GuiContainer = document.getElementById('brain2_line_GuiContainer');//添加控制界面
brain2_line_GuiContainer.appendChild(gui.domElement);

const select_folder = gui.addFolder('Select Dataset');

select_folder.add(preferences, 'datasets-elect',['ADHD','ASD']).name('datasets-elect').onFinishChange(function(value){

    if (value !== datasetselect) {
        let uri = window.location.href;
        window.location.href = updateQueryStringParameter(uri, 'datasets-elect', value);
    }
});

var dataset_folder = gui.addFolder('ADHD-200 Dataset');

var adhd_samples = {};
for(i = 1;i<=96;i++){
    adhd_samples["ADHD No. "+i]=i;
}

var tdc_samples = {};
for(i = 1;i<=91;i++){
    tdc_samples["TDC No. "+i]=i;
}

dataset_folder.add(preferences, 'adhd_sample',adhd_samples).name('ADHD Sample').onFinishChange(function(value){
    if(value!=adhd_sample){
        adhd_sample=value;
    }
});

dataset_folder.add(preferences, 'tdc_sample',tdc_samples).name('TDC Sample').onFinishChange(function(value){
    if(value!=tdc_sample){
        tdc_sample=value;
    }
});

dataset_folder.add(preferences, 'frame_of_reference', ['ADHD','TDC']).name('Frame of Ref.').onFinishChange(function(value){
    if(value!=frame_of_reference){
        frame_of_reference=value;
    }
});

dataset_folder.add(preferences, 'window_size',10,50).step(10).name('Window Size').onFinishChange(function(value){
    if(value!=window_size){
        window_size=value;
    }
});

dataset_folder.add(preferences, 'window_step',5,50).step(5).name('Window Step').onFinishChange(function(value){
    if(value!=window_step){
        window_step=value;
    }
});

dataset_folder.add(preferences, 'filter_threshold',0,100).step(.1).name('Filter Threshold').onFinishChange(function(value){
    if(value!=filter_threshold){
        filter_threshold=value;
    }
});

// dataset_folder.open();

var layout_folder = gui.addFolder('Layout Preferences');

layout_folder.add(preferences,'toggle_label').name('Toggle Label').onFinishChange(function(value){
    console.log(value);
    uri = window.location.href;
    uri = updateQueryStringParameter(uri, 'toggle_label', value.toString());
    window.history.pushState(null,'',uri);

    if(value){
        labels.attr('opacity',function(d){
            return labelOpacityScale(d.value);
        });
    }else{
        labels.attr('opacity',function(d){
            return 0;
        });
    }
});

layout_folder.add(preferences,'force_charge',-900,-100).step(-10).name('Force Charge').onFinishChange(function(value){
    if(value!=force_charge){
        force_charge=value;
    }
});
// layout_folder.open();
// select_folder.open();


//切换3d大脑使用的数组
var agui = new dat.GUI();
var aGuiContainer = document.getElementById('array-select');//添加控制界面
aGuiContainer.appendChild(agui.domElement);

// var bdataset_folder = agui.addFolder('Dataset');
//
// bdataset_folder.add(preferences, 'ChooseDataset', ['ADHD','TDC']).name('ChooseDataset').onFinishChange(function(value){
//     if(value!==ChooseDataset){
//         ChooseDataset=value;
//         console.log("dataset---"+value);
//     }
// });

var adataset_folder = agui.addFolder('Menu');

// var adhd_arrays = {};
// for(i = 1;i<=96;i++){
//     adhd_arrays["ADHD No. "+i]=i;
// }

// var tdc_arrays = {};
// for(i = 1;i<=91;i++){
//     tdc_arrays["TDC No. "+i]=i;
// }

// adataset_folder.add(preferences, 'adhd_array',adhd_arrays).name('ADHD Array').onFinishChange(function(value){
//     if(value!==adhd_array){
//         adhd_array=value;
//         console.log("adhd---"+value);
//     }
// });

// adataset_folder.add(preferences, 'tdc_array',tdc_arrays).name('TDC Array').onFinishChange(function(value){
//     if(value!==tdc_array){
//         tdc_array=value;
//         console.log("tdc---"+value);
//     }
//
// });

var adhd_arrays = {};
adhd_arrays["Left"]= 'left';
adhd_arrays["Right"]= 'right';
adhd_arrays["Front"]= 'front';
adhd_arrays["Back"]= 'back';
adhd_arrays["Top"]= 'top';
adhd_arrays["Bottom"]= 'bottom';
adhd_arrays["Custom"]= '-';

adataset_folder.add(preferences, 'adhd_array',adhd_arrays).name('View-select').onFinishChange(function(value){
    if(value!==adhd_array){

    }
});

adataset_folder.add(preferences, 'opacity',0,100).step(.1).name('Opacity').onFinishChange(function(value){
    if(value!==opacity) {
        opacity = value / 300;
        rslice[0]["opacity"] = data[0]["opacity"] = opacity;
        rslice[1]["opacity"] = data[1]["opacity"] = opacity;
        bslice[0]["opacity"] = fslice[0]["opacity"] = opacity;
        bslice[1]["opacity"] = fslice[1]["opacity"] = opacity;

        Plotly.react("connectome-plot", data,
            getLayout("connectome-plot", "select-view", false),
            getConfig());
        Plotly.react("brain-right", rslice,
            getSliceLayout("brain-right", "right", false),
            getSliceConfig());
        Plotly.react("brain-front", fslice,
            getSliceLayout("brain-front", "front", false),
            getSliceConfig());
        Plotly.react("brain-back", bslice,
            getSliceLayout("brain-back", "back", false),
            getSliceConfig());
    }
});

adataset_folder.add(preferences,'toggle_colorbar').name('Colorbar').onFinishChange(function(value){
    console.log(value);
    uri = window.location.href;
    uri = updateQueryStringParameter(uri, 'toggle_colorbar', value.toString());
    window.history.pushState(null,'',uri);

    // if(value){
    //     labels.attr('opacity',function(d){
    //         return labelOpacityScale(d.value);
    //     });
    // }else{
    //     labels.attr('opacity',function(d){
    //         return 0;
    //     });
    // }
});

adataset_folder.add(preferences,'Switch').name('Show all').onFinishChange(function(value){
    console.log(value);
    uri = window.location.href;
    uri = updateQueryStringParameter(uri, 'Switch', value.toString());
    window.history.pushState(null,'',uri);

    // if(value){
    //     labels.attr('opacity',function(d){
    //         return labelOpacityScale(d.value);
    //     });
    // }else{
    //     labels.attr('opacity',function(d){
    //         return 0;
    //     });
    // }
});

// bdataset_folder.open();
// adataset_folder.open();

