/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="..//typings/d3/d3.d.ts" />

var width = $(window).width();
var height = $(window).height();
$("#worldmap").css({
    "width": width / 2,
    "height": height - 50,
    "margin-left": width / 2 - 25 + "px",
    "margin-top": "25px",
    "border": "solid 2px #00BFFF"
});

var mymap = L.map('worldmap').setView([30.8, 119.97], 10);

var worldmap = L.tileLayer('/mapHuZhou/{z}/{x}/{y}.png', {
    maxZoom: 14,
    minZoom: 10
}).addTo(mymap);

var heatmap = L.tileLayer('/heatmap/1220/122000/{z}/{x}/{y}.png', {
    maxZoom: 14,
    minZoom: 10
}).addTo(mymap);

//render chart

$(function () {

    var w = $("#chartPerHour").width();
    var h = $("#chartPerHour").height();

    var data = [];

    data = d3.range(0, 24).map(function () {
        return Math.random() * 30;
    });

    var dateData = [];
    dateData = d3.range(0, 6).map(function () {
        return Math.random() * 30;
    });

    var colors = d3.scale.category20();

    function renderPerHourChart(data) {
        window.localStorage.hour = "00";

        d3.select("#chartPerHour").selectAll("*").remove();

        var chartSvg = d3.select("#chartPerHour")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        //绘制坐标轴
        var linearX = d3.scale.linear().domain([0, 23]).range([0, 600]);
        var linearY = d3.scale.linear().domain([0, 30]).range([300, 0]);

        var xAxis = d3.svg.axis()
            .scale(linearX)
            .orient("bottom")
            .ticks(24)
            .tickFormat(function (d) {
                return d + "时";
            });

        var yAxis = d3.svg.axis()
            .scale(linearY)
            .orient("left")
            .ticks(20)
            .tickFormat(function (d) {
                return d + "";
            });

        var axisGroupX = chartSvg.append("g").attr("class", "axisGroup");
        var axisGroupY = chartSvg.append("g").attr("class", "axisGroup");

        var xAxisX = 50;
        var xAxisY = 350;

        var yAxisX = 50;
        var yAxisY = 50;
        axisGroupX.attr("transform", "translate(" + xAxisX + "," + xAxisY + ")").call(xAxis);
        axisGroupY.attr("transform", "translate(" + yAxisX + "," + yAxisY + ")").call(yAxis);

        chartSvg.selectAll("text").attr("fill", function () {
            return "white";
        });

        //绘制散点
        var scatter = chartSvg.append("g").attr("class", "scatterGroup");
        // scatter.attr("transform", "translate(" + xAxisX + "," + xAxisY + ")");
        scatter.attr("transform", "translate(" + yAxisX + "," + yAxisY + ")");

        scatter.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr({
                "cx": function (d, i) {
                    return 0;
                },
                "cy": function (d, i) {
                    return 0;
                },
                "r": function (d, i) {
                    return 0;
                },
                "fill": function (d, i) {
                    return colors(i);
                },
                "stroke-width": function () {
                    return "2";
                },
                "stroke": function (params) {
                    return "white";
                },
                "opacity": function () {
                    return 0;
                }
            })
            .transition()
            .duration(function () {
                return 1200;
            })
            .ease("linear")
            .attr({
                "cx": function (d, i) {
                    return linearX(i);
                },
                "cy": function (d, i) {
                    return linearY(d);
                },
                "r": function (d, i) {
                    return 5;
                },
                "fill": function (d, i) {
                    return colors(i);
                },
                "stroke-width": function () {
                    return "2";
                },
                "stroke": function (params) {
                    return "white";
                },
                "opacity": function () {
                    return 1;
                },
                "data": function (d, i) {
                    if ((i + "").length == 1)
                        i = "0" + i;
                    return i + "," + d;
                }
            });

        scatter.selectAll("circle")
            .on({
                "mouseover": function () {
                    window.localStorage.hour = d3.select(this).attr("data").split(",")[0];//存储小时
                    var date = window.localStorage.date;
                    var hour = window.localStorage.hour;

                    var month = Math.floor(date / 100);
                    var day = Math.floor(date % 100);

                    // console.log($("#month").text());

                    $("#month").html(month);
                    $("#day").html(day);
                    $("#hour").html(hour);

                    $(".leaflet-layer")["1"].remove();
                    heatmap = L.tileLayer("/heatmap/" + date + "/" + date + hour + "/{z}/{x}/{y}.png", {
                        maxZoom: 14,
                        minZoom: 10
                    }).addTo(mymap);

                    d3.select(this)
                        .attr("stroke-width", "2")
                        .attr("stroke", function () {
                            return "orange";
                        });
                    var x = d3.select(this).attr("cx");
                    var y = d3.select(this).attr("cy");
                    var d = d3.select(this).attr("data");
                    chartSvg.append("text")
                        .attr({
                            "class": function name(params) {
                                return "circleTitle";
                            },
                            "x": function () {
                                return x;
                            },
                            "y": function () {
                                return y;
                            },
                            "dx": function () {
                                return 0;
                            },
                            "dy": function () {
                                return 30;
                            },
                            "fill": function () {
                                return "white";
                            }
                        })
                        .style({
                            "font-size": function () {
                                return 15;
                            }
                        })
                        .text(function () {
                            return "data is " + d;
                        });

                    var crossLines = chartSvg.append("g").attr("class", "crossLines");
                    crossLines.append("line")
                        .attr({
                            "x1": 0,
                            "y1": y,
                            "x2": x,
                            "y2": y,
                            "stroke-width": 1,
                            "stroke": function () {
                                return "orange";
                            },
                            "transform": "translate(" + yAxisX + "," + yAxisY + ")"
                        });
                    crossLines.append("line")
                        .attr({
                            "x1": x,
                            "y1": 300,
                            "x2": x,
                            "y2": y,
                            "stroke-width": 1,
                            "stroke": function () {
                                return "orange";
                            },
                            "transform": "translate(" + yAxisX + "," + yAxisY + ")"
                        });


                    // $(".leaflet-layer")["1"].remove();
                    // heatmap = L.tileLayer('/heatmap/1220/12200/{z}/{x}/{y}.png', {
                    //     maxZoom: 14,
                    //     minZoom: 10
                    // }).addTo(mymap);
                },
                "mouseout": function () {
                    d3.select(this)
                        .attr("stroke-width", "2")
                        .attr("stroke", function () {
                            return "white";
                        });
                    chartSvg.selectAll(".circleTitle").remove();
                    chartSvg.selectAll(".crossLines").remove();
                }
            });

        $("#chartPerHour").on("mouseover", function () {
            $(this).css({
                "cursor": "pointer",
                "background-color": "rgba(100,100,100,0.7)"
            });
        });

        $("#chartPerHour").on("mouseout", function () {
            $(this).css({
                "cursor": "auto",
                "background-color": "rgba(100,100,100,0.5)"
            });
        });
    }

    function renderPerDayChart(data) {
        window.localStorage.date = "1217";

        d3.select("#chartPerDay").selectAll("*").remove();

        var chartSvg = d3.select("#chartPerDay")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        //绘制坐标轴
        var linearX = d3.scale.linear().domain([1217, 1222]).range([0, 600]);
        var linearY = d3.scale.linear().domain([0, 30]).range([300, 0]);

        var xAxis = d3.svg.axis()
            .scale(linearX)
            .orient("bottom")
            .ticks(6)
            .tickFormat(function (d) {
                var month = Math.floor((d / 100)) + "";
                var day = (d % 100) + "";
                return month + "月" + day + "日";
            });

        var yAxis = d3.svg.axis()
            .scale(linearY)
            .orient("left")
            .ticks(20)
            .tickFormat(function (d) {
                return d + "";
            });

        var axisGroupX = chartSvg.append("g").attr("class", "axisGroup");
        var axisGroupY = chartSvg.append("g").attr("class", "axisGroup");

        var xAxisX = 50;
        var xAxisY = 350;

        var yAxisX = 50;
        var yAxisY = 50;
        axisGroupX.attr("transform", "translate(" + xAxisX + "," + xAxisY + ")").call(xAxis);
        axisGroupY.attr("transform", "translate(" + yAxisX + "," + yAxisY + ")").call(yAxis);

        chartSvg.selectAll("text").attr("fill", function () {
            return "white";
        });

        //绘制散点
        var scatter = chartSvg.append("g").attr("class", "scatterGroup");
        // scatter.attr("transform", "translate(" + xAxisX + "," + xAxisY + ")");
        scatter.attr("transform", "translate(" + yAxisX + "," + yAxisY + ")");

        scatter.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr({
                "cx": function (d, i) {
                    return 0;
                },
                "cy": function (d, i) {
                    return 0;
                },
                "r": function (d, i) {
                    return 0;
                },
                "fill": function (d, i) {
                    return colors(i);
                },
                "stroke-width": function () {
                    return "2";
                },
                "stroke": function (params) {
                    return "white";
                },
                "opacity": function () {
                    return 0;
                }
            })
            .transition()
            .duration(function () {
                return 1200;
            })
            .ease("linear")
            .attr({
                "cx": function (d, i) {
                    return linearX(i + 1217);
                },
                "cy": function (d, i) {
                    return linearY(d);
                },
                "r": function (d, i) {
                    return 5;
                },
                "fill": function (d, i) {
                    return colors(i);
                },
                "stroke-width": function () {
                    return "2";
                },
                "stroke": function (params) {
                    return "white";
                },
                "opacity": function () {
                    return 1;
                },
                "data": function (d, i) {
                    return i + 1217 + "," + d;
                }
            });

        scatter.selectAll("circle")
            .on({
                "mouseover": function () {
                    window.localStorage.date = d3.select(this).attr("data").split(",")[0]; //存储日期
                    var date = window.localStorage.date;
                    var hour = window.localStorage.hour;

                    $(".leaflet-layer")["1"].remove();
                    heatmap = L.tileLayer("/heatmap/" + date + "/" + date + hour + "/{z}/{x}/{y}.png", {
                        maxZoom: 14,
                        minZoom: 10
                    }).addTo(mymap);

                    d3.select(this)
                        .attr("stroke-width", "2")
                        .attr("stroke", function () {
                            return "orange";
                        });
                    var x = d3.select(this).attr("cx");
                    var y = d3.select(this).attr("cy");
                    var d = d3.select(this).attr("data");
                    chartSvg.append("text")
                        .attr({
                            "class": function name(params) {
                                return "circleTitle";
                            },
                            "x": function () {
                                return x;
                            },
                            "y": function () {
                                return y;
                            },
                            "dx": function () {
                                return 0;
                            },
                            "dy": function () {
                                return 30;
                            },
                            "fill": function () {
                                return "white";
                            }
                        })
                        .style({
                            "font-size": function () {
                                return 15;
                            }
                        })
                        .text(function () {
                            return "data is " + d;
                        });

                    var crossLines = chartSvg.append("g").attr("class", "crossLines");
                    crossLines.append("line")
                        .attr({
                            "x1": 0,
                            "y1": y,
                            "x2": x,
                            "y2": y,
                            "stroke-width": 1,
                            "stroke": function () {
                                return "orange";
                            },
                            "transform": "translate(" + yAxisX + "," + yAxisY + ")"
                        });
                    crossLines.append("line")
                        .attr({
                            "x1": x,
                            "y1": 300,
                            "x2": x,
                            "y2": y,
                            "stroke-width": 1,
                            "stroke": function () {
                                return "orange";
                            },
                            "transform": "translate(" + yAxisX + "," + yAxisY + ")"
                        });
                },
                "mouseout": function () {
                    d3.select(this)
                        .attr("stroke-width", "2")
                        .attr("stroke", function () {
                            return "white";
                        });
                    chartSvg.selectAll(".circleTitle").remove();
                    chartSvg.selectAll(".crossLines").remove();
                }
            });

        $("#chartPerDay").on("mouseover", function () {
            $(this).css({
                "cursor": "pointer",
                "background-color": "rgba(100,100,100,0.7)"
            });
        });

        $("#chartPerDay").on("mouseout", function () {
            $(this).css({
                "cursor": "auto",
                "background-color": "rgba(100,100,100,0.5)"
            });
        });
    }

    renderPerHourChart(data);
    renderPerDayChart(dateData);
});