// js/views/searchresults.js

var app = app || {};

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

    // create new model in Food collection.
    var name = this.model.get("name");
    var calories = this.model.get("calories");

    app.foods.create({
      name: name,
      calories: calories
    });

    app.recentresults.create({
      name: name
    });
 
    /*
        the create will trigger an "add" event.
        AppView listens for the add on the foods collection.
        It calls render, which runs the foodView,
        which updates the DOM with the list of foods
        and recent results.
    */

    // Not sure if this is the right place for this:
    app.searchresults.reset();

  }
});
