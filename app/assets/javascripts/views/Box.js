define([
    'd3'
], function (
    d3
) {
    function Box(y) {

        var width = 5,
            height = 40,
            duration = 1000,
            domain = null,
            min = 0,
            max = 19,
            whiskers = [1,4],
            tickFormat = null,
            yScale = y;

        // For each small multiple…
        function box(g) {
            g.each(function (d, i) {
                // g is one container of one boxplot
                var g = d3.select(this),
                    ageRange = d.ageInterval,
                    n = d.percentOfTotal,
                    min = d.min,
                    lowerQ = d.lowerQ,
                    avg = d.avg,
                    higherQ = d.higherQ,
                    max = d.max,
                    lowerWhisker = d.lowerWhisker,
                    higherWhisker = d.higherWhisker;

                // TODO: to be tested visually if min max problem is solved

                if(max > 4*(higherQ-lowerQ)) {
                    max = higherQ+(higherQ-lowerQ);
                }

                // Compute quartiles. Must return exactly 3 elements.
                var quartileData = [d.lowerQ, d.avg, d.higherQ];

                var whiskerIndices = [lowerWhisker, higherWhisker];

                // Compute the new x-scale.
//                var x1 = d3.scale.linear()
//                    .domain(domain && domain.call(this, d, i) || [min, max])
//                    .range([height, 0]);
//                console.log(x1);

               // var x1 = d3.scale.linear()
                //    .domain([min, max])
                 //   .range([height, 0]);

                // Retrieve the old x-scale, if this is an update.
                var x0 = this.__chart__ || d3.scale.linear()
                        .domain([0, Infinity])
                        .range(yScale.range());

                // Stash the new scale.
                this.__chart__ = yScale;

                // Note: the box, median, and box tick elements are fixed in number,
                // so we only have to handle enter and update. In contrast, the outliers
                // and other elements are variable, so we need to exit them! Variable
                // elements also fade in and out.

                // Update center line: the vertical line spanning the whiskers.
                var center = g.selectAll("line.center")
                    .data(whiskerIndices ? [whiskerIndices] : []);

                center.enter().insert("line", "rect")
                    .attr("class", "center")
                    .attr("x1", width / 2)
                    .attr("y1", function (d) {
                        return x0(d[0]);
                    })
                    .attr("x2", width / 2)
                    .attr("y2", function (d) {
                        return x0(d[1]);
                    })
                    .style("opacity", 1e-6)
                    .transition()
                    .duration(duration)
                    .style("opacity", 1)
                    .attr("y1", function (d) {
                        return yScale(d[0]);
                    })
                    .attr("y2", function (d) {
                        return yScale(d[1]);
                    });

                center.transition()
                    .duration(duration)
                    .style("opacity", 1)
                    .attr("y1", function (d) {
                        return yScale(d[0]);
                    })
                    .attr("y2", function (d) {
                        return yScale(d[1]);
                    });

                center.exit().transition()
                    .duration(duration)
                    .style("opacity", 1e-6)
                    .attr("y1", function (d) {
                        return yScale(d[0]);
                    })
                    .attr("y2", function (d) {
                        return yScale(d[1]);
                    })
                    .remove();

                // Update innerquartile box.
                var box = g.selectAll("rect.box")
                    .data([quartileData]);
                // attribute y is not
                box.enter().append("rect")
                    .attr("class", "box")
                    .attr("x", 0)
                    .attr("y", function (d) {
                        return x0(d[2]);
                    })
                    .attr("width", width)
                    .attr("height", function (d) {
                        return x0(d[0]) - x0(d[2]);
                    })
                    .transition()
                    .duration(duration)
                    .attr("y", function (d) {
                        return yScale(d[2]);
                    })
                    .attr("height", function (d) {
                        return yScale(d[0]) - yScale(d[2]);
                    });

                box.transition()
                    .duration(duration)
                    .attr("y", function (d) {
                        return yScale(d[2]);
                    })
                    .attr("height", function (d) {
                        return yScale(d[0]) - yScale(d[2]);
                    });

                // Update median line.
                var medianLine = g.selectAll("line.median")
                    .data([quartileData[1]]);

                medianLine.enter().append("line")
                    .attr("class", "median")
                    .attr("x1", 0)
                    .attr("y1", x0)
                    .attr("x2", width)
                    .attr("y2", x0)
                    .transition()
                    .duration(duration)
                    .attr("y1", yScale)
                    .attr("y2", yScale);

                medianLine.transition()
                    .duration(duration)
                    .attr("y1", yScale)
                    .attr("y2", yScale);

                // Update whiskers.
                var whisker = g.selectAll("line.whisker")
                    .data(whiskerIndices || []);

                whisker.enter().insert("line", "circle, text")
                    .attr("class", "whisker")
                    .attr("x1", 0)
                    .attr("y1", x0)
                    .attr("x2", width)
                    .attr("y2", x0)
                    .style("opacity", 1e-6)
                    .transition()
                    .duration(duration)
                    .attr("y1", yScale)
                    .attr("y2", yScale)
                    .style("opacity", 1);

                whisker.transition()
                    .duration(duration)
                    .attr("y1", yScale)
                    .attr("y2", yScale)
                    .style("opacity", 1);

                whisker.exit().transition()
                    .duration(duration)
                    .attr("y1", yScale)
                    .attr("y2", yScale)
                    .style("opacity", 1e-6)
                    .remove();

                // Compute the tick format.
                var format = tickFormat || yScale.tickFormat(8);

                // Update box ticks.
                var boxTick = g.selectAll("text.box")
                    .data(quartileData);

                boxTick.enter().append("text")
                    .attr("class", "box")
                    .attr("dy", ".3em")
                    .attr("dx", function (d, i) {
                        return i & 1 ? 6 : -6
                    })
                    .attr("x", function (d, i) {
                        return i & 1 ? width : 0
                    })
                    .attr("y", x0)
                    .attr("text-anchor", function (d, i) {
                        return i & 1 ? "start" : "end";
                    })
                    .text(format)
                    .transition()
                    .duration(duration)
                    .attr("y", yScale);

                boxTick.transition()
                    .duration(duration)
                    .text(format)
                    .attr("y", yScale);

                // Update whisker ticks. These are handled separately from the box
                // ticks because they may or may not exist, and we want don't want
                // to join box ticks pre-transition with whisker ticks post-.
                var whiskerTick = g.selectAll("text.whisker")
                    .data(whiskerIndices || []);

                whiskerTick.enter().append("text")
                    .attr("class", "whisker")
                    .attr("dy", ".3em")
                    .attr("dx", 6)
                    .attr("x", width)
                    .attr("y", x0)
                    .text(format)
                    .style("opacity", 1e-6)
                    .transition()
                    .duration(duration)
                    .attr("y", yScale)
                    .style("opacity", 1);

                whiskerTick.transition()
                    .duration(duration)
                    .text(format)
                    .attr("y", yScale)
                    .style("opacity", 1);

                whiskerTick.exit().transition()
                    .duration(duration)
                    .attr("y", yScale)
                    .style("opacity", 1e-6)
                    .remove();
            });
            d3.timer.flush();
        }

        box.width = function (x) {
            if (!arguments.length) return width;
            width = x;
            return box;
        };

        box.height = function (x) {
            if (!arguments.length) return height;
            height = x;
            return box;
        };

        box.domain = function (x) {
            if (!arguments.length) return domain;
            domain = x == null ? x : d3.functor(x);
            return box;
        };

        box.whiskers = function (x) {

            if (!arguments.length) return whiskers;
            whiskers = x;
            return box;
        };

        box.min = function (x) {
            if (!arguments.length) return min;
            min = x;
            return box;
        };

        box.max = function (x) {
            if (!arguments.length) return max;
            max = x;
            return box;
        };

        return box;
    }

    return Box;
});