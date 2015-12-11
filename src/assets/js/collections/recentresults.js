// js/collections/recentresults.js

var app = app || {};

var RecentResults = Backbone.Collection.extend({
  model: app.SearchResult,
  localStorage: new Backbone.LocalStorage('recentresults-backbone'),
});

app.recentresults = new RecentResults([]);
