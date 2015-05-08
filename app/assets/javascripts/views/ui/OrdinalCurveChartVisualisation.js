define(['View', 'views/OrdinalCurveChart', 'helpers/converters/NumberByAgeDatasetConverter', 'helpers/converters/DatasetSorter'],
function(View, OrdinalCurveChart, NumberByAgeDatasetConverter, DatasetSorter)
{
    function OrdinalCurveChartVisualisation(_width, _height){
        var _this = new View('<div></div>');
        var chart = new OrdinalCurveChart(_width, _height);

        _this.initialize = function(){
            _this.add(chart
                .title(function(entity) { return entity.codes[0].code[0].code + ': ' + entity.codes[0].code[0].text_de })
                .display(function(entity) { return entity.data })
                .x('interval')
                .y('amount'));
        };

        /**
         * Updates this visualisation based upon the given description and datasets.
         * @param codes
         */
        _this.visualiseData = function (codes){
                var data = _.map(codes, function(code) {
                    var sorter = new DatasetSorter(code.datasets);
                    var sortedDatasets = sorter.sortByIntervalsAscending();
                    var converter = new NumberByAgeDatasetConverter(sortedDatasets);
                    return converter.asAbsoluteData();
                });
                data = _.sortBy(data, function(d){return d.interval});
                chart.on({codes: codes, data: data});
        };

        _this.initialize();

        return _this;
    }

    return OrdinalCurveChartVisualisation;
});