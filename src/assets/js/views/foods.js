// js/views/foods.js

var app = app || {};

/*
    app.FoodView: generates table row for each food.
    Also handles three user events.
*/

app.FoodView = Backbone.View.extend({
  tagName: 'tr',

  template: _.template($('#food-template').html()),

  className: 'table-data-food',

  events: {
    'mouseover .calories-data': 'showRemovePrompt',
    'mouseleave .calories-data': 'hideRemovePrompt',
    'click .calories-data': 'destroyFood'
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
      destroyFood: destroys a single food item when user clicks on "Remove?"
      This removes it from localStorage and generates a "remove" event.
      AppView listens for a remove event and calls RemoveAndAddAllFoods,
      which will rebuild the list of (remaining) foods.
  */

  destroyFood: function() {
    this.model.destroy();
  }
});
