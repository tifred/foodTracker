// js/views/foods.js

var app = app || {};

/*
    app.FoodView: adds table data for each food.
    Also handles three user events.
*/

app.FoodView = Backbone.View.extend({
  tagName: 'tr',

  template: _.template($('#food-template').html()),

  className: 'table-data-food',

  events: {
    'mouseover .calories-data': 'showRemovePrompt',
    'mouseleave .calories-data': 'hideRemovePrompt',
    'click .calories-data': 'removeFood'
  },

  initialize: function() {
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },

  showRemovePrompt: function() {
    this.$el.find('.calories-data').text('Remove?');
  },

  hideRemovePrompt: function() {
    this.$el.find('.calories-data').text('' + this.model.get("calories") + '');
  },

  /*
      AppView listens for the remove event and calls addAllFoods,
      which will rebuild the list of (remaining) foods.
  */

  removeFood: function() {
    app.foods.remove(this.model);
  }
});
