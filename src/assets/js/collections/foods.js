// js/collections/foods.js

var app = app || {};

var Foods = Backbone.Collection.extend({
  model: app.Food,
  localStorage: new Backbone.LocalStorage('foods-backbone'),
});

app.foods = new Foods([]);
