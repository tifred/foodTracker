// js/views/searchresults.js

var app = app || {};

app.SearchResultView = Backbone.View.extend({
  tagName: 'li',

  events: {
    'click div': 'addFood'
  },

  initialize: function() {
  },

  render: function() {
    this.$el.html('<div>' + this.model.get("name") + '</div>');
    return this;
  },

  addFood: function() {

    // Search results should vanish cause user clicked on one.
    app.searchresults.reset();

    // create new model in Food collection.
    var name = this.model.get("name");
    var calories = this.model.get("calories");

    app.foods.create({
      name: name,
      calories: calories
    });

    // the create will trigger an "add" event.
    // AppView listens for the add on the foods collection.
    // It calls render, which runs the foodView, 
    // which updates the DOM with the list of foods.

  }
});
