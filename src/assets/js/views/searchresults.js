// js/views/searchresults.js

var app = app || {};

app.SearchResultView = Backbone.View.extend({
  tagName: 'li',

  template: _.template($('#search-result-template').html()),

  events: {
    'click div': 'createFood'
  },

  initialize: function() {
  },

  render: function() {
    // this.$el.html('<div>' + this.model.get("name") + '</div>');
    this.$el.html(this.template(this.model.attributes));
    return this;
  },

  createFood: function() {

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

    // Not sure if this is the right place for this:
    app.searchresults.reset();

  }
});
