/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="..//typings/d3/d3.d.ts" />

$(function() {

    //huzhou map
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

    var worldmap = L.tileLayer('/leaflet_heatmap/mapHuZhou/{z}/{x}/{y}.png', {
        maxZoom: 14,
        minZoom: 10
    }).addTo(mymap);

    $(".leaflet-tile-container img").each(function(index, elem) {
        if ($(this).attr("src").split("/")[1] === "mapHuZhou") {
            $(this).css({
                "-webkit-filter": "invert(1)"
            })
        }
    });

    loadHeatmap();

    //chartPerDay
    window.localStorage.date = "1217";
    window.localStorage.hour = "00";

    d3.json("/leaflet_heatmap/data/count/count.json", function(error, data) {
        var root = data;

        var w = $("#chartPerHour").width();
        var h = $("#chartPerHour").height();
        var colors = d3.scale.category20();

        drawPerDayChart(data);
        drawPerHourChart(data);

        function drawPerDayChart(data) {
            d3.select("#chartPerDay").selectAll("*").remove();

            var chartSvg = d3.select("#chartPerDay")
                .append("svg")
                .attr({
                    "width": w,
                    "height": h
                });

            //绘制坐标轴
            var sum = [];
            for (var index in data) {
                var o = data[index];
                var d = o["data"];
                var tsum = 0;
                for (var i in d) {
                    var td = d[i]["number"];
                    tsum += parseInt(td);
                }
                sum.push([o["date"], tsum]);
            }

            sum.sort(function(a, b) {
                return a[1] - b[1];
            });

            var countMax = sum[sum.length - 1][1] / 10000;
            var countMin = sum[0][1] / 10000;

            var linearX = d3.scale.linear().domain([1217, 1222]).range([0, 600]);
            var linearY = d3.scale.linear().domain([countMin, countMax]).range([300, 0]);

            //半径插值
            var linearR = d3.scale.linear().domain([countMin, countMax]).range([5, 15]);

            var xAxis = d3.svg.axis()
                .scale(linearX)
                .orient("bottom")
                .ticks(6)
                .tickFormat(function(d) {
                    var month = Math.floor((d / 100)) + "";
                    var day = (d % 100) + "";
                    return month + "月" + day + "日";
                });

            var yAxis = d3.svg.axis()
                .scale(linearY)
                .orient("left")
                .ticks(20)
                .tickFormat(function(d) {
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

            chartSvg.selectAll("text").attr("fill", function() {
                return "white";
            });

            //绘制散点
            var scatter = chartSvg.append("g").attr("class", "scatterGroup");
            scatter.attr("transform", "translate(" + yAxisX + "," + yAxisY + ")");
            scatter.selectAll("circle")
                .data(sum)
                .enter()
                .append("circle")
                .attr({
                    "cx": function(d, i) {
                        return 0;
                    },
                    "cy": function(d, i) {
                        return 0;
                    },
                    "r": function(d, i) {
                        return 0;
                    },
                    "fill": function(d, i) {
                        return colors(i);
                    },
                    "stroke-width": function() {
                        return "1";
                    },
                    "stroke": function(params) {
                        return "white";
                    },
                    "opacity": function() {
                        return 0;
                    }
                })
                .transition()
                .duration(function() {
                    return 1200;
                })
                .ease("linear")
                .attr({
                    "cx": function(d, i) {
                        return linearX(parseInt(d[0]));
                    },
                    "cy": function(d, i) {
                        return linearY(d[1] / 10000);
                    },
                    "r": function(d, i) {
                        return linearR(d[1] / 10000);
                    },
                    "fill": function(d, i) {
                        return colors(i);
                    },
                    "stroke-width": function() {
                        return "2";
                    },
                    "stroke": function(params) {
                        return "white";
                    },
                    "opacity": function() {
                        return 1;
                    },
                    "data": function(d, i) {
                        return d;
                    }
                });

            scatter.selectAll("circle")
                .on({
                    "click": function() {
                        loadHeatmap();
                        reDrawPerHourChart(root);
                    },
                    "mouseover": function() {
                        var data = d3.select(this).attr("data").split(",");
                        window.localStorage.date = data[0];

                        var cx = d3.select(this).attr("cx");
                        var cy = d3.select(this).attr("cy");

                        chartSvg.append("text")
                            .attr({
                                "class": "circleInfo",
                                "x": cx,
                                "y": cy,
                                "dx": 0,
                                "dy": 30,
                                "fill": "white"
                            })
                            .style("font-size", "10px")
                            .text(function() {
                                var m = Math.floor(data[0] / 100);
                                var d = Math.floor(data[0] % 100);
                                var count = data[1];
                                return m + "月" + d + "日,数据量: " + count;
                            });

                        d3.select(this)
                            .attr({
                                "opacity": d3.select(this).attr("opacity")
                            })
                            .transition()
                            .duration(200)
                            .ease("linear")
                            .attr({
                                "opacity": 0.2,
                                "cursor": "pointer"
                            });
                    },
                    "mouseout": function() {
                        chartSvg.selectAll(".circleInfo").remove();
                        d3.select(this)
                            .attr({
                                "opacity": d3.select(this).attr("opacity")
                            })
                            .transition()
                            .duration(250)
                            .ease("linear")
                            .attr({
                                "opacity": 1,
                                "cursor": "auto"
                            });
                    }
                });
        }

        function reDrawPerHourChart(data) {

            var sum = [];
            for (var index in data) {
                var o = data[index];
                var d = o["data"];
                var tsum = 0;
                for (var i in d) {
                    sum.push(d[i]["number"]);
                }
            }

            sum.sort(function(a, b) {
                return a - b;
            });

            var countMax = sum[sum.length - 1] / 10000;
            var countMin = sum[0] / 10000;

            var linearX = d3.scale.linear().domain([0, 23]).range([0, 600]);
            var linearY = d3.scale.linear().domain([countMin, countMax]).range([300, 0]);

            //半径插值
            var linearR = d3.scale.linear().domain([countMin, countMax]).range([2, 10]);

            var date = window.localStorage.date;
            var hour = window.localStorage.hour;

            var nowData;
            for (var index in data) {
                if (data[index]["date"] === date) {
                    nowData = data[index]["data"];
                }
            }

            var scatter = d3.select("#chartPerHour").select("svg .scatterGroup");

            scatter.selectAll("circle")
                .transition()
                .duration(1200)
                .ease("linear")
                .attr({
                    "cx": function(d, i) {
                        return linearX(parseInt(nowData[i]["time"]));
                        // return linearX(parseInt(d["time"]));
                    },
                    "cy": function(d, i) {
                        return linearY(parseInt(nowData[i]["number"]) / 10000);
                        // return linearY(parseInt(d["number"]) / 10000);
                    },
                    "r": function(d, i) {
                        return linearR(parseInt(nowData[i]["number"]) / 10000);
                        // return linearR(parseInt(d["number"]) / 10000);
                    },
                    "stroke-width": "2",
                    "stroke": "white",
                    "fill": function(d, i) {
                        return colors(i);
                    },
                    "data": function(d, i) {
                        return nowData[i]["time"] + ";" + nowData[i]["number"];
                    }
                });
        }

        function drawPerHourChart(data) {
            d3.select("#chartPerHour").selectAll("*").remove();

            var chartSvg = d3.select("#chartPerHour")
                .append("svg")
                .attr({
                    "width": w,
                    "height": h
                });

            //绘制坐标轴
            var sum = [];
            for (var index in data) {
                var o = data[index];
                var d = o["data"];
                var tsum = 0;
                for (var i in d) {
                    sum.push(d[i]["number"]);
                }
            }

            sum.sort(function(a, b) {
                return a - b;
            });

            var countMax = sum[sum.length - 1] / 10000;
            var countMin = sum[0] / 10000;

            var linearX = d3.scale.linear().domain([0, 23]).range([0, 600]);
            var linearY = d3.scale.linear().domain([countMin, countMax]).range([300, 0]);

            //半径插值
            var linearR = d3.scale.linear().domain([countMin, countMax]).range([2, 10]);

            var xAxis = d3.svg.axis()
                .scale(linearX)
                .orient("bottom")
                .ticks(24)
                .tickFormat(function(d) {
                    return d + "时";
                });

            var yAxis = d3.svg.axis()
                .scale(linearY)
                .orient("left")
                .ticks(20)
                .tickFormat(function(d) {
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

            chartSvg.selectAll("text").attr("fill", function() {
                return "white";
            });

            var scatter = chartSvg.append("g").attr("class", "scatterGroup");
            scatter.attr("transform", "translate(" + yAxisX + "," + yAxisY + ")");

            var date = window.localStorage.date;
            var hour = window.localStorage.hour;

            var nowDate;
            for (var index in data) {
                if (data[index]["date"] === date) {
                    nowDate = data[index]["data"];
                }
            }

            scatter.selectAll("circle")
                .data(nowDate)
                .enter()
                .append("circle")
                .attr({
                    "cx": function(d, i) {
                        return 0;
                    },
                    "cy": function(d, i) {
                        return 0;
                    },
                    "r": function() {
                        return 0;
                    },
                    "stroke-width": "0",
                    "stroke": "white",
                    "fill": function(d, i) {
                        return colors(i);
                    },
                    "opacity": 0
                })
                .transition()
                .duration(1200)
                .ease("linear")
                .attr({
                    "cx": function(d, i) {
                        return linearX(parseInt(d["time"]));
                    },
                    "cy": function(d, i) {
                        return linearY(parseInt(d["number"]) / 10000);
                    },
                    "r": function(d, i) {
                        return linearR(parseInt(d["number"]) / 10000);
                    },
                    "stroke-width": "2",
                    "stroke": "white",
                    "fill": function(d, i) {
                        return colors(i);
                    },
                    "opacity": 1,
                    "data": function(d, i) {
                        return d["time"] + ";" + d["number"];
                    }
                });

            scatter.selectAll("circle")
                .on({
                    "click": function() {
                        loadHeatmap();
                    },
                    "mouseover": function() {
                        var data = d3.select(this).attr("data");
                        var hour = data.split(";")[0];
                        var number = data.split(";")[1];

                        window.localStorage.hour = hour;

                        var cx = d3.select(this).attr("cx");
                        var cy = d3.select(this).attr("cy");

                        chartSvg.append("text")
                            .attr({
                                "class": "circleInfo",
                                "x": cx,
                                "y": cy,
                                "dx": 0,
                                "dy": 30,
                                "fill": "white"
                            })
                            .style("font-size", "10px")
                            .text(function() {
                                return hour + "时,数据量: " + number;
                            });

                        d3.select(this)
                            .attr("opacity", d3.select(this).attr("opacity"))
                            .transition()
                            .duration(200)
                            .ease("linear")
                            .attr({
                                "opacity": 0.2,
                                "cursor": "pointer"
                            });
                    },
                    "mouseout": function() {
                        chartSvg.selectAll(".circleInfo").remove();

                        d3.select(this)
                            .attr("opacity", d3.select(this).attr("opacity"))
                            .transition()
                            .duration(200)
                            .ease("linear")
                            .attr({
                                "opacity": 1,
                                "cursor": "auto"
                            });
                    }
                });
        }
    });

    // worldmap.on("")
    function loadHeatmap() {
        var hourHeatmap = window.localStorage.hour + "";
        var dateHeatmap = window.localStorage.date + "";

        if ((hourHeatmap).length == 1)
            hourHeatmap = "0" + hourHeatmap;

        if ($(".leaflet-layer").length == 2)
            $(".leaflet-layer")["1"].remove();
        heatmap = L.tileLayer("/leaflet_heatmap/heatmap/" + dateHeatmap + "/" + dateHeatmap + hourHeatmap + "/{z}/{x}/{y}.png", {
            maxZoom: 14,
            minZoom: 10
        }).addTo(mymap);

        //update time;
        var month = Math.floor(dateHeatmap / 100);
        var day = Math.floor(dateHeatmap % 100);
        var hour = hourHeatmap;

        $("#month").text(month);
        $("#day").text(day);
        $("#hour").text(hour);

    }

    mymap.on("zoomend", function() {
        $(".leaflet-tile-container img").each(function(index, elem) {
            if ($(this).attr("src").split("/")[1] === "mapHuZhou") {
                $(this).css({
                    "-webkit-filter": "invert(1)"
                })
            }
        });
    });

    mymap.on("drag", function() {
        $(".leaflet-tile-container img").each(function(index, elem) {
            if ($(this).attr("src").split("/")[1] === "mapHuZhou") {
                $(this).css({
                    "-webkit-filter": "invert(1)"
                })
            }
        });
    })
});
