define([
    'View',
    'Announcer',
    'announcements/OnAlphabeticalItemsUpdated'
], function(
    View,
    Announcer,
    OnAlphabeticalItemsUpdated
) {

    function OnItemClicked(item) {
        var _this = this;
        _this.item = function () {
            return item;
        };
    }

    function GroupView () {
        var _this = new View('<div class="row left" style="width: 100%; max-width: 100%"></div>');
        var name = new View('<div class="medium-1 large-1 columns"></div>');
        var content = new View ('<div class="medium-11 large-11 columns"></div>');
        var list = new View ('<ul class="no-bullet"></ul>');
        var announcer = new Announcer();

        var model;

        _this.announcer = function () {
            return announcer;
        };

        _this.model = function (_model) {
            if (_.isUndefined(_model)) return model;
            model = _model;
            _this.render();
        };

        _this.render = function () {
            name.html(_this.model().label());
            _this.add(name);
            _this.renderList();
            content.add(list);
            _this.add(content);
        };

        _this.renderList = function () {
            if (_.size(_this.model().items()) > 4) {
                _this.renderItemsIn(_.first(_this.model().items(),2), list);
                list.add(_this.newExpandItem());
                _this.renderItemsIn(_.last(_this.model().items(),2), list);
                return;
            }

            _this.renderItemsIn(_this.model().items(), list);
        };

        _this.renderItemsIn = function (_items, _list) {
            _.each(_items, function (each) {
                var item = _this.newItem();
                item.find('a').text(_this.model().selector().nameOf(each));
                item.click(function() {
                    _this.announcer().announce(new OnItemClicked(each));
                });
                _list.add(item);
            });
        };

        _this.newExpandItem = function () {
            var expand = _this.newItem();
            expand.html('...');
            return expand;
        };

        _this.newItem = function () {
            return new View('<li><a></a></li>')
        };

        return _this;
    }

    function AlphabeticalSelector() {
        var _this = new View('<div></div>');
        var header;
        var list;
        var model;

        _this.model = function (_model) {
            if (_.isUndefined(_model)) return model;
            model = _model;
            model.announcer().onSendTo(OnAlphabeticalItemsUpdated, _this.onItemsUpdated, _this);
            _this.render();
        };

        _this.render = function () {
            _this.cleanAll();
            header = _this.renderCharacterList();
            list = _this.renderGroupList();
            _this.add(header);
            _this.add(list);
        };

        _this.renderCharacterList = function () {
            var list = _this.newCharacterList();
            _.each(_this.model().groups(), function (group) {
                var item = _this.newCharacterListItem();
                item.find('a').text(group.label());
                list.add(item);
            });
            return list;
        };

        _this.renderGroupList = function () {
            var list = new View('<div style="display: inline-block; width: 100%"></div>');
            _.each(_.filter(_this.model().groups(), function(each) {return each.isNotEmpty()}), function (each) {
                list.add(_this.renderGroup(each));
            });
            return list;
        };

        _this.cleanAll = function () {
            if (!_.isUndefined(list))
                list.children().each(function(index, group) {
                    $(group).me().announcer().unsubscribe(_this);
                });
            _this.empty();
        };

        _this.renderGroup = function (group) {
            var view = new GroupView();
            view.model(group);
            view.announcer().onSendTo(OnItemClicked, _this.onItemClicked,_this);
            return view;
        };

        _this.newCharacterList = function () {
            return new View('<ul class="inline-list"></ul>');
        };

        _this.newCharacterListItem = function () {
            return new View('<li><a></a></li>')
        };

        _this.onItemClicked = function (ann) {
            _this.model().selectItem(ann.item());
        };

        _this.onItemsUpdated = function () {
            _this.render();
        };

        return _this;
    }

    return AlphabeticalSelector;

});