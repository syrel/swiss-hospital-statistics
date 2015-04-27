define([
    'views/widgets/TopBar',
    'models/AlphabeticalSelectorModel',
    'models/SearchProcessor',
    'views/widgets/AlphabeticalSelector',
    'views/widgets/CodeVisualisationCard',
    'views/widgets/SearchField',
    'announcements/OnAlphabeticalItemSelected',
    'announcements/OnSearchProcessorFiltered'
], function(
    TopBar,
    AlphabeticalSelectorModel,
    SearchProcessor,
    AlphabeticalSelector,
    CodeVisualisationCard,
    SearchField,
    OnAlphabeticalItemSelected,
    OnSearchProcessorFiltered
){

    "use strict";
    function App() {
        var _this = this;

        _this.initialize = function(){
            var topBar = new TopBar();
            topBar.title('Eonum');
            var button = topBar.newButton('ICD');
            button.beActive();

            topBar.addLeft(button);
            topBar.addLeft(topBar.newButton('CHOP'));
            topBar.addLeft(topBar.newButton('DRG'));
            $('header').append(topBar);
            _this.visualise();
        };

        _this.visualise = function () {
            var pane = $('<div class="row full-width"></div>');
            var leftPane = $('<div class="large-5 columns"></div>');
            var rightPane = $('<div class="large-7 columns"></div>');
            pane.append(leftPane);
            pane.append(rightPane);

            $('body').append('<div class="row"></div>');
            $('body').append(pane);

            var selectorModel = new AlphabeticalSelectorModel();
            selectorModel.nameLogic(function(item){
                return item.code + " "+item.text_de;
            });

            selectorModel.announcer().onSendTo(OnAlphabeticalItemSelected, function(ann) {
                codeCard.on(ann.item().type, ann.item().short_code);
            },_this);

            var selectorView = new AlphabeticalSelector();
            selectorView.class('full-width');
            selectorView.model(selectorModel);

            leftPane.append(selectorView);

            var codeCard = new CodeVisualisationCard();
            codeCard.class('full-width');
            rightPane.append(codeCard);

            var processor = new SearchProcessor();
            processor.ignoreCase();
            processor.nameLogic(function(item){
                return item.short_code + " "+item.code + " "+item.text_de;
            });
            processor.announcer().onSendTo(OnSearchProcessorFiltered, function(ann) {
                selectorModel.items(ann.candidates());
            },_this);

            var search = new SearchField();
            search.class('full-width');
            leftPane.prepend(search);

            $.getJSON("/api/v1/codes/icd", function(result){
                processor.allCandidates(result);
                search.model(processor);
            });
        };


        //TODO: dummy-method until development of top-3 is done
        _this.displayTopThreeDiagnosis = function(){

        };
        
        _this.initialize();
    }

    return App
});
