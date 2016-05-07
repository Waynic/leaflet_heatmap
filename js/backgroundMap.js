/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="..//typings/d3/d3.d.ts" />

var worldMap = d3.select("#backgroundWorldMap")
    .append("svg")
    .attr({
        "width": function (params) {
            return $(window).width();
        },
        "height": function () {
            return $(window).height();
        }
    });

var projection = d3.geo.equirectangular()
    .center([-90, 45])
    .scale(300);
// .translate([100,100])
var path = d3.geo.path().projection(projection);

d3.json("data/world.json", function (error, data) {
    if (error) {
        console.log(error);
        return;
    }

    worldMap.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr({
            "stroke": function () {
                return "white";
            },
            "fill": function () {
                return "#2C2C43";
            },
            "d": path
        })

});