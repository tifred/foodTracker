// js/views/foods.js

var app = app || {};

app.FoodSavedDayView = Backbone.View.extend({
  tagName: 'tr',

  events: {
  },

  initialize: function() {
  },

  render: function() {
    this.$el.html('<td>' + this.model.get("name") + '</td><td class="calories-data">' + this.model.get("calories") + '</td'); 
    return this; 
  }

});




