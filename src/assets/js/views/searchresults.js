// js/views/searchresults.js

var app = app || {};

/*
    app.SearchResultView: adds list data for each search result.
    Also handles clicks on each result, which will
      a) add a food to food table.
      b) add to the recent results list.
*/

app.SearchResultView = Backbone.View.extend({
  tagName: 'li',

  template: _.template($('#search-result-template').html()),

  events: {
    'click .search-result-data': 'createFoodandRecentResults'
  },

  initialize: function() {
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },

  createFoodandRecentResults: function() {

    /*
        Create new model in foods collection and recentresults collection.
        The create will trigger an "add" event.
        AppView has "listenTo"s that listen for the add on the two collections
        and call methods to "add" to the DOM.
    */

    var name = this.model.get("name");
    var calories = this.model.get("calories");

    app.foods.create({
      name: name,
      calories: calories
    });

    app.recentresults.create({
      name: name,
      calories: calories
    });
  }
});
