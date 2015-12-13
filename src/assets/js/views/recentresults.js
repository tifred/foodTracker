// js/views/recentresults.js

var app = app || {};

/*
    app.RecentResultView: adds list data for recent results.
    Also handles clicks, which add selected food to the list.
    app.FoodView does that too, but it also adds to the recent results,
    which would be redundant in this case.
*/

app.RecentResultView = Backbone.View.extend({
  tagName: 'li',

  template: _.template($('#recent-result-template').html()),

  events: {
    'click div': 'createFood'
  },

  initialize: function() {
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },

  createFood: function() {

    /*
        Create new model in foods collection.
        The create will trigger an "add" event.
        AppView has a "listenTo" that listens
        for the add on the collection
        and calls a method to "add" to the DOM.
    */

    var name = this.model.get("name");
    var calories = this.model.get("calories");

    app.foods.create({
      name: name,
      calories: calories
    });
  }
});
