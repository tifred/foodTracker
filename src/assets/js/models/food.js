// js/models/food.js

var app = app || {};

app.Food = Backbone.Model.extend({
  defaults: {
    name: 'gruel',
    calories: 200
  }
});
