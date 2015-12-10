// js/views/foods.js

var app = app || {};

app.FoodView = Backbone.View.extend({
  tagName: 'tr',

  className: 'table-data-food',

  events: {
    'mouseover .calories-data': 'showRemovePrompt',
    'mouseleave .calories-data': 'hideRemovePrompt',
    'click .calories-data': 'removeFood'
  },

  initialize: function() {
  },

  render: function() {
    this.$el.html('<td>' + this.model.get("name") + '</td><td class="calories-data">' + this.model.get("calories") + '</td');
    return this;
  },

  showRemovePrompt: function() {
    console.log("in showRemoveP");
    this.$el.find('.calories-data').text('Remove?');
  },

  hideRemovePrompt: function() {
    this.$el.find('.calories-data').text('' + this.model.get("calories") + '');
  },

  // AppView listens for the remove event and calls render
  // which updates the DOM, which removes the view of the food.
  removeFood: function() {
    app.foods.remove(this.model);
  }
});
